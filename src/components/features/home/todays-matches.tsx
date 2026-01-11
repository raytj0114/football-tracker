import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { footballAPI } from '@/lib/football-api/client';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import type { Match } from '@/types/football-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getMatchStatusLabel, getMatchStatusVariant } from '@/lib/football-api/constants';
import { cn } from '@/lib/utils';

function formatTime(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

function getToday(): string {
  const now = new Date();
  const isoString = now.toISOString();
  return isoString.slice(0, 10); // YYYY-MM-DD format
}

interface CompactMatchCardProps {
  match: Match;
}

function CompactMatchCard({ match }: CompactMatchCardProps) {
  const { homeTeam, awayTeam, score, status, utcDate, competition } = match;
  const isFinished = status === 'FINISHED';
  const isLive = status === 'IN_PLAY' || status === 'PAUSED';

  return (
    <Card
      className={cn(
        'w-[280px] flex-shrink-0 overflow-hidden transition-all hover:shadow-md',
        isLive && 'ring-2 ring-live/50'
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {competition.emblem && (
              <Image
                src={competition.emblem}
                alt={competition.name}
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
            )}
            <span className="text-xs text-muted-foreground">{competition.code}</span>
          </div>
          <Badge variant={getMatchStatusVariant(status)} className="text-xs">
            {isLive && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
            {isFinished || isLive ? getMatchStatusLabel(status) : formatTime(utcDate)}
          </Badge>
        </div>

        {/* Teams */}
        <div className="space-y-2">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {homeTeam.crest ? (
                <Image
                  src={homeTeam.crest}
                  alt={homeTeam.shortName || homeTeam.name || ''}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="h-6 w-6 rounded bg-muted" />
              )}
              <span className="text-sm font-medium truncate max-w-[140px]">
                {homeTeam.shortName || homeTeam.name || 'TBD'}
              </span>
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                isLive && 'text-live',
                isFinished &&
                  score.fullTime.home !== null &&
                  score.fullTime.away !== null &&
                  score.fullTime.home > score.fullTime.away &&
                  'text-win'
              )}
            >
              {isFinished || isLive ? (score.fullTime.home ?? 0) : '-'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {awayTeam.crest ? (
                <Image
                  src={awayTeam.crest}
                  alt={awayTeam.shortName || awayTeam.name || ''}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="h-6 w-6 rounded bg-muted" />
              )}
              <span className="text-sm font-medium truncate max-w-[140px]">
                {awayTeam.shortName || awayTeam.name || 'TBD'}
              </span>
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                isLive && 'text-live',
                isFinished &&
                  score.fullTime.home !== null &&
                  score.fullTime.away !== null &&
                  score.fullTime.away > score.fullTime.home &&
                  'text-win'
              )}
            >
              {isFinished || isLive ? (score.fullTime.away ?? 0) : '-'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

async function fetchTodaysMatches(): Promise<Match[]> {
  const today = getToday();
  const allMatches: Match[] = [];

  // Fetch matches from all leagues in parallel
  const results = await Promise.allSettled(
    AVAILABLE_LEAGUES.map((league) =>
      footballAPI.getMatches(league.code, {
        dateFrom: today,
        dateTo: today,
      })
    )
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allMatches.push(...result.value.matches);
    }
  }

  // Sort: live first, then scheduled/upcoming, then finished
  // Within each group, sort by time
  return allMatches.sort((a, b) => {
    const aIsLive = a.status === 'IN_PLAY' || a.status === 'PAUSED';
    const bIsLive = b.status === 'IN_PLAY' || b.status === 'PAUSED';
    const aIsFinished = a.status === 'FINISHED';
    const bIsFinished = b.status === 'FINISHED';

    // Live matches first
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;

    // Then scheduled/upcoming matches
    if (!aIsFinished && bIsFinished) return -1;
    if (aIsFinished && !bIsFinished) return 1;

    // Within same category, sort by time
    return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
  });
}

export async function TodaysMatches() {
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    matches = await fetchTodaysMatches();
  } catch (e) {
    error = e instanceof Error ? e.message : '試合データの取得に失敗しました';
  }

  if (error) {
    return null; // Silently fail - don't break the homepage
  }

  if (matches.length === 0) {
    return (
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            今日の試合
          </h2>
        </div>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">今日の試合はありません</p>
        </Card>
      </section>
    );
  }

  const liveCount = matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          今日の試合
          {liveCount > 0 && (
            <Badge variant="live" className="ml-2">
              {liveCount} LIVE
            </Badge>
          )}
        </h2>
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-1">
            すべて見る
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Horizontal scrollable container */}
      <div className="overflow-x-hidden">
        <div className="flex gap-3 overflow-x-auto py-1 pl-0.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {matches.slice(0, 10).map((match) => (
            <CompactMatchCard key={match.id} match={match} />
          ))}
          {matches.length > 10 && (
            <Link href="/matches" className="flex-shrink-0">
              <Card className="flex h-full w-[120px] items-center justify-center p-4 transition-colors hover:bg-muted/50">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">+{matches.length - 10}試合</span>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
