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
  input: GenerateCommentInput
): Promise<GenerateCommentResult> {
  try {
    const validated = GenerateCommentSchema.parse(input);
    const cacheKey = `${validated.leagueCode}:${validated.teamId}:${validated.matchday ?? 0}`;

    // Check cache
    const cached = await prisma.teamComment.findUnique({
      where: { cacheKey },
    });

    if (cached && cached.expiresAt > new Date()) {
      return { success: true, comment: cached.comment };
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
  const drawRate = data.playedGames > 0 ? ((data.draw / data.playedGames) * 100).toFixed(0) : '0';
  const lossRate = data.playedGames > 0 ? ((data.lost / data.playedGames) * 100).toFixed(0) : '0';
  const avgPointsPerGame = data.playedGames > 0 ? (data.points / data.playedGames).toFixed(2) : '0';

  const recentResultsLine = matchContext.recentResults
    ? `- 直近の試合結果: ${matchContext.recentResults}（左が最新、○勝△分×敗）`
    : '';
  const nextOpponentLine = matchContext.nextOpponent
    ? `- 次の対戦: vs ${matchContext.nextOpponent}`
    : '';

  return `以下のサッカーチームの成績データから読み取れる推察やコメントを、敬語で述べてください。

【チーム情報】
- チーム名: ${data.teamName}
- リーグ: ${getLeagueName(data.leagueCode)}
- 現在順位: ${data.position}位/${data.totalTeams}チーム中 ${positionZone}
- 消化試合数: ${data.playedGames}試合（第${data.matchday ?? '?'}節時点）

【成績データ】
- 勝敗: ${data.won}勝 ${data.draw}分 ${data.lost}敗
- 勝率: ${winRate}% / 引分率: ${drawRate}% / 敗率: ${lossRate}%
- 勝ち点: ${data.points}点（1試合平均: ${avgPointsPerGame}点）
- 得失点差: ${data.goalDifference > 0 ? '+' : ''}${data.goalDifference}

【リーグでの立ち位置】
- 首位との勝ち点差: ${data.pointsFromLeader}点（首位: ${data.leaderPoints}点）
- 降格圏との勝ち点差: +${data.pointsFromRelegation}点（降格圏: ${data.relegationPoints}点）
${recentResultsLine}
${nextOpponentLine}

【コメント要件】
- 2〜3文、120〜180文字程度で、必ず文を完結させる
- 敬語（です・ます調）で、サッカーファンに話しかけるような自然な文章
- チームの現状、調子、順位争いの状況を簡潔にコメント
- 絵文字は使用しない

【出力形式】
コメントのみを出力してください。`;
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
  const drawRate = data.playedGames > 0 ? ((data.draw / data.playedGames) * 100).toFixed(0) : '0';
  const lossRate = data.playedGames > 0 ? ((data.lost / data.playedGames) * 100).toFixed(0) : '0';
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

  return `以下のUEFAチャンピオンズリーグ（CL）のチーム成績データから読み取れる推察やコメントを、敬語で述べてください。

【大会フォーマット】
2024-25シーズンのCLは36チームによるリーグフェーズ形式です。
- 各チームは8試合（ホーム4試合、アウェイ4試合）を戦います
- 上位8チーム: ラウンド16に直接進出
- 9〜24位: プレーオフラウンド進出（2試合制で勝者がラウンド16へ）
- 25位以下: 敗退

【チーム情報】
- チーム名: ${data.teamName}
- 現在順位: ${data.position}位/${data.totalTeams}チーム中 ${positionZone}
- 消化試合数: ${data.playedGames}試合（全8試合中）

【成績データ】
- 勝敗: ${data.won}勝 ${data.draw}分 ${data.lost}敗
- 勝率: ${winRate}% / 引分率: ${drawRate}% / 敗率: ${lossRate}%
- 勝ち点: ${data.points}点（1試合平均: ${avgPointsPerGame}点）
- 得失点差: ${data.goalDifference > 0 ? '+' : ''}${data.goalDifference}

【リーグフェーズでの立ち位置】
- 首位との勝ち点差: ${data.pointsFromLeader}点（首位: ${data.leaderPoints}点）
- プレーオフ圏境界（24位）の勝ち点: ${playoffBorderPoints}点
${recentResultsLine}
${nextOpponentLine}

【コメント要件】
- 2〜3文、120〜180文字程度で、必ず文を完結させる
- 敬語（です・ます調）で、サッカーファンに話しかけるような自然な文章
- ラウンド16直接進出、プレーオフ進出、敗退の観点でコメント
- 「降格」という表現は使わない（CLに降格の概念はありません）
- 絵文字は使用しない

【出力形式】
コメントのみを出力してください。`;
}
