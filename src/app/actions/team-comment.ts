'use server';

import { prisma } from '@/lib/prisma';
import { generateWithGeminiWithRetry, GeminiAPIError } from '@/lib/gemini/client';
import { footballAPI } from '@/lib/football-api/client';
import { z } from 'zod';

const GenerateCommentSchema = z.object({
  teamId: z.number(),
  teamName: z.string(),
  position: z.number(),
  playedGames: z.number(),
  won: z.number(),
  draw: z.number(),
  lost: z.number(),
  points: z.number(),
  goalDifference: z.number(),
  leagueCode: z.string(),
  matchday: z.number().nullable(),
  // リーグ文脈
  leaderPoints: z.number(),
  pointsFromLeader: z.number(),
  relegationPoints: z.number(),
  pointsFromRelegation: z.number(),
  totalTeams: z.number(),
});

export type GenerateCommentInput = z.infer<typeof GenerateCommentSchema>;

export type GenerateCommentResult =
  | { success: true; comment: string }
  | { success: false; error: string };

interface MatchContext {
  recentResults: string;
  nextOpponent: string | null;
}

async function getTeamMatchContext(leagueCode: string, teamId: number): Promise<MatchContext> {
  try {
    const matchesData = await footballAPI.getMatches(leagueCode);
    const teamMatches = matchesData.matches.filter(
      (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId
    );

    // 直近5試合の結果
    const finished = teamMatches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
      .slice(0, 5);

    const recentResults = finished
      .map((m) => {
        const isHome = m.homeTeam.id === teamId;
        if (m.score.winner === 'DRAW') return '△';
        if (
          (isHome && m.score.winner === 'HOME_TEAM') ||
          (!isHome && m.score.winner === 'AWAY_TEAM')
        )
          return '○';
        return '×';
      })
      .join('');

    // 次の試合
    const nextMatch = teamMatches
      .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())[0];

    const nextOpponent = nextMatch
      ? nextMatch.homeTeam.id === teamId
        ? `${nextMatch.awayTeam.shortName ?? nextMatch.awayTeam.name}(H)`
        : `${nextMatch.homeTeam.shortName ?? nextMatch.homeTeam.name}(A)`
      : null;

    return { recentResults, nextOpponent };
  } catch (error) {
    console.error('Failed to fetch match context:', error);
    return { recentResults: '', nextOpponent: null };
  }
}

export async function generateTeamComment(
  input: GenerateCommentInput,
  skipCache: boolean = false
): Promise<GenerateCommentResult> {
  try {
    const validated = GenerateCommentSchema.parse(input);
    const cacheKey = `${validated.leagueCode}:${validated.teamId}:${validated.matchday ?? 0}`;

    // Check cache (unless skipCache is true)
    if (!skipCache) {
      const cached = await prisma.teamComment.findUnique({
        where: { cacheKey },
      });

      if (cached && cached.expiresAt > new Date()) {
        return { success: true, comment: cached.comment };
      }
    }

    // 試合データを取得
    const matchContext = await getTeamMatchContext(validated.leagueCode, validated.teamId);

    // Generate with Gemini API (リーグに応じたプロンプトを使用)
    const prompt =
      validated.leagueCode === 'CL'
        ? buildCLPrompt(validated, matchContext)
        : buildPrompt(validated, matchContext);
    const comment = await generateWithGeminiWithRetry(prompt);

    // Save to cache (24 hours TTL)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.teamComment.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        comment,
        expiresAt,
      },
      update: {
        comment,
        expiresAt,
      },
    });

    return { success: true, comment };
  } catch (error) {
    console.error('Failed to generate team comment:', error);

    if (error instanceof GeminiAPIError) {
      if (error.status === 429) {
        return {
          success: false,
          error: 'しばらく時間をおいて再試行してください',
        };
      }
      return { success: false, error: 'AIコメントの生成に失敗しました' };
    }

    if (error instanceof z.ZodError) {
      return { success: false, error: 'データの検証に失敗しました' };
    }

    return { success: false, error: 'コメントの生成に失敗しました' };
  }
}

function buildPrompt(data: GenerateCommentInput, matchContext: MatchContext): string {
  const positionZone = getPositionZone(data.position, data.leagueCode);
  const winRate = data.playedGames > 0 ? ((data.won / data.playedGames) * 100).toFixed(0) : '0';
  const avgPointsPerGame = data.playedGames > 0 ? (data.points / data.playedGames).toFixed(2) : '0';

  const recentResultsLine = matchContext.recentResults
    ? `- 直近の試合結果: ${matchContext.recentResults}（左が最新、○勝△分×敗）`
    : '';
  const nextOpponentLine = matchContext.nextOpponent
    ? `- 次の対戦: vs ${matchContext.nextOpponent}`
    : '';

  return `あなたは中立的なプロのサッカー解説者です。
以下の【チームデータ】に基づき、客観的な分析コメントを生成してください。

【必須ルール】
- 2〜3文、120〜180文字程度で完結させる
- 敬語（です・ます調）で自然に
- チーム名に「様」などの敬称をつけない
- 「祈ります」「応援」などファン目線の表現は使わない
- 絵文字は使用しない

【チームデータ】
- チーム: ${data.teamName}（${getLeagueName(data.leagueCode)}）
- 順位: ${data.position}位/${data.totalTeams}チーム中 ${positionZone}
- 第${data.matchday ?? '?'}節時点: ${data.won}勝${data.draw}分${data.lost}敗（勝率${winRate}%）
- 勝ち点: ${data.points}点（1試合平均${avgPointsPerGame}点）
- 得失点差: ${data.goalDifference > 0 ? '+' : ''}${data.goalDifference}
- 首位との差: ${data.pointsFromLeader}点 / 降格圏との差: +${data.pointsFromRelegation}点
${recentResultsLine}
${nextOpponentLine}`;
}

function getLeagueName(code: string): string {
  const leagues: Record<string, string> = {
    PL: 'プレミアリーグ',
    PD: 'ラ・リーガ',
    BL1: 'ブンデスリーガ',
    SA: 'セリエA',
    FL1: 'リーグ・アン',
    CL: 'UEFAチャンピオンズリーグ',
  };
  return leagues[code] ?? code;
}

function getPositionZone(position: number, leagueCode: string): string {
  // Premier League zones
  if (leagueCode === 'PL') {
    if (position <= 4) return '(CL圏内)';
    if (position === 5) return '(EL圏内)';
    if (position >= 18) return '(降格圏)';
  }

  // La Liga zones
  if (leagueCode === 'PD') {
    if (position <= 4) return '(CL圏内)';
    if (position <= 6) return '(EL圏内)';
    if (position >= 18) return '(降格圏)';
  }

  // Bundesliga zones
  if (leagueCode === 'BL1') {
    if (position <= 4) return '(CL圏内)';
    if (position <= 6) return '(EL圏内)';
    if (position === 16) return '(プレーオフ圏)';
    if (position >= 17) return '(降格圏)';
  }

  // Serie A zones
  if (leagueCode === 'SA') {
    if (position <= 4) return '(CL圏内)';
    if (position <= 6) return '(EL圏内)';
    if (position >= 18) return '(降格圏)';
  }

  // Ligue 1 zones
  if (leagueCode === 'FL1') {
    if (position <= 3) return '(CL圏内)';
    if (position === 4) return '(CL予選圏)';
    if (position === 5) return '(EL圏内)';
    if (position >= 16) return '(降格圏)';
  }

  return '';
}

function getCLPositionZone(position: number): string {
  if (position <= 8) return '(ラウンド16直接進出圏)';
  if (position <= 24) return '(プレーオフ進出圏)';
  return '(敗退圏)';
}

function buildCLPrompt(data: GenerateCommentInput, matchContext: MatchContext): string {
  const positionZone = getCLPositionZone(data.position);
  const winRate = data.playedGames > 0 ? ((data.won / data.playedGames) * 100).toFixed(0) : '0';
  const avgPointsPerGame = data.playedGames > 0 ? (data.points / data.playedGames).toFixed(2) : '0';

  const recentResultsLine = matchContext.recentResults
    ? `- 直近の試合結果: ${matchContext.recentResults}（左が最新、○勝△分×敗）`
    : '';
  const nextOpponentLine = matchContext.nextOpponent
    ? `- 次の対戦: vs ${matchContext.nextOpponent}`
    : '';

  // ラウンド16直接進出圏（8位）との勝ち点差を計算
  // relegationPoints には 24位の勝ち点が渡される想定
  const playoffBorderPoints = data.relegationPoints;

  return `あなたは中立的なプロのサッカー解説者です。
以下の【チームデータ】に基づき、客観的な分析コメントを生成してください。

【必須ルール】
- 2〜3文、120〜180文字程度で完結させる
- 敬語（です・ます調）で自然に
- チーム名に「様」などの敬称をつけない
- 「祈ります」「応援」などファン目線の表現は使わない
- 「降格」という表現は使わない（CLに降格の概念はない）
- 絵文字は使用しない

【大会形式】
CLリーグフェーズ: 1〜8位→R16直接進出、9〜24位→プレーオフ、25位以下→敗退

【チームデータ】
- チーム: ${data.teamName}（UEFAチャンピオンズリーグ）
- 順位: ${data.position}位/${data.totalTeams}チーム中 ${positionZone}
- ${data.playedGames}/8試合消化: ${data.won}勝${data.draw}分${data.lost}敗（勝率${winRate}%）
- 勝ち点: ${data.points}点（1試合平均${avgPointsPerGame}点）
- 得失点差: ${data.goalDifference > 0 ? '+' : ''}${data.goalDifference}
- 首位との差: ${data.pointsFromLeader}点 / PO圏境界(24位): ${playoffBorderPoints}点
${recentResultsLine}
${nextOpponentLine}`;
}
