import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, Clock } from 'lucide-react';
import { auth } from '@/auth';
import { getFavorites } from '@/app/actions/favorites';
import { footballAPI } from '@/lib/football-api/client';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import type { Match } from '@/types/football-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getMatchStatusLabel, getMatchStatusVariant } from '@/lib/football-api/constants';
import { cn } from '@/lib/utils';

function formatMatchTime(utcDate: string): string {
  const date = new Date(utcDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  // If match is in the past
  if (diffMs < 0) {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    });
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}日後`;
  }
  if (diffHours > 0) {
    return `${diffHours}時間後`;
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes}分後`;
}

interface FavoriteMatchCardProps {
  match: Match;
  favoriteTeamId: number;
}

function FavoriteMatchCard({ match, favoriteTeamId }: FavoriteMatchCardProps) {
  const { homeTeam, awayTeam, score, status, utcDate, competition } = match;
  const isFinished = status === 'FINISHED';
  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFavoriteHome = homeTeam.id === favoriteTeamId;
  const favoriteTeam = isFavoriteHome ? homeTeam : awayTeam;
  const opponentTeam = isFavoriteHome ? awayTeam : homeTeam;
  const favoriteScore = isFavoriteHome ? score.fullTime.home : score.fullTime.away;
  const opponentScore = isFavoriteHome ? score.fullTime.away : score.fullTime.home;

  return (
    <Link href={`/teams/${favoriteTeamId}`}>
      <Card
        className={cn(
          'overflow-hidden transition-all hover:shadow-md',
          isLive && 'ring-2 ring-live/50'
        )}
      >
        <div className="p-4">
          {/* Favorite Team Header */}
          <div className="mb-3 flex items-center gap-3">
            {favoriteTeam.crest ? (
              <Image
                src={favoriteTeam.crest}
                alt={favoriteTeam.name || ''}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {favoriteTeam.shortName || favoriteTeam.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {competition.emblem && (
                  <Image
                    src={competition.emblem}
                    alt={competition.name}
                    width={12}
                    height={12}
                    className="h-3 w-3 object-contain"
                  />
                )}
                <span>{competition.code}</span>
              </div>
            </div>
            <Heart className="h-4 w-4 fill-primary text-primary" />
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {isFavoriteHome ? 'HOME' : 'AWAY'}
              </Badge>
              {opponentTeam.crest ? (
                <Image
                  src={opponentTeam.crest}
                  alt={opponentTeam.name || ''}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="h-6 w-6 rounded bg-muted" />
              )}
              <span className="text-sm font-medium truncate max-w-[100px]">
                {opponentTeam.shortName || opponentTeam.name || 'TBD'}
              </span>
            </div>

            {isFinished || isLive ? (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-lg font-bold',
                    isLive && 'text-live',
                    isFinished &&
                      favoriteScore !== null &&
                      opponentScore !== null &&
                      favoriteScore > opponentScore &&
                      'text-win'
                  )}
                >
                  {favoriteScore ?? 0} - {opponentScore ?? 0}
                </span>
                <Badge variant={getMatchStatusVariant(status)} className="text-xs">
                  {isLive && (
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  {getMatchStatusLabel(status)}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatMatchTime(utcDate)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

async function fetchFavoriteTeamMatches(teamIds: number[]): Promise<Map<number, Match | null>> {
  const result = new Map<number, Match | null>();

  if (teamIds.length === 0) {
    return result;
  }

  // Get today's date and 7 days ahead
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = nextWeek.toISOString().split('T')[0];

  // Fetch matches from all leagues
  const allMatches: Match[] = [];
  const fetchResults = await Promise.allSettled(
    AVAILABLE_LEAGUES.map((league) => footballAPI.getMatches(league.code, { dateFrom, dateTo }))
  );

  for (const fetchResult of fetchResults) {
    if (fetchResult.status === 'fulfilled') {
      allMatches.push(...fetchResult.value.matches);
    }
  }

  // Find next match for each favorite team
  for (const teamId of teamIds) {
    const teamMatches = allMatches
      .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    // Prioritize live matches, then upcoming
    const liveMatch = teamMatches.find((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
    const nextMatch =
      liveMatch || teamMatches.find((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');

    result.set(teamId, nextMatch || null);
  }

  return result;
}

export async function FavoriteMatches() {
  const session = await auth();

  // Don't show for non-authenticated users
  if (!session?.user) {
    return null;
  }

  let favorites: Awaited<ReturnType<typeof getFavorites>> = [];
  let matchMap = new Map<number, Match | null>();
  let error: string | null = null;

  try {
    favorites = await getFavorites();
    if (favorites.length > 0) {
      matchMap = await fetchFavoriteTeamMatches(favorites.map((f) => f.teamId));
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'お気に入り情報の取得に失敗しました';
  }

  if (error || favorites.length === 0) {
    return null; // Don't show section if no favorites or error
  }

  // Filter to only teams with upcoming matches
  const teamsWithMatches = favorites.filter((f) => matchMap.get(f.teamId) !== null);

  if (teamsWithMatches.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          お気に入りチームの試合
        </h2>
        <Link href="/favorites">
          <Button variant="ghost" size="sm" className="gap-1">
            すべて見る
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {teamsWithMatches.slice(0, 4).map((favorite) => {
          const match = matchMap.get(favorite.teamId);
          if (!match) return null;
          return (
            <FavoriteMatchCard
              key={favorite.teamId}
              match={match}
              favoriteTeamId={favorite.teamId}
            />
          );
        })}
      </div>
    </section>
  );
}
