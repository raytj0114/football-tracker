import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { footballAPI } from '@/lib/football-api/client';
import { DEFAULT_LEAGUE, AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import { MatchListWithFilters } from '@/components/features/matches/match-list-with-filters';
import { LeagueSelector } from '@/components/features/matches/league-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '試合一覧 | Football Tracker',
  description: 'サッカーの試合情報を確認できます',
};

interface Props {
  searchParams: Promise<{ league?: string }>;
}

function MatchListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

async function MatchListWrapper({ league }: { league: string }) {
  const [matchesData, standingsData, session] = await Promise.all([
    footballAPI.getMatches(league),
    footballAPI.getStandings(league),
    auth(),
  ]);
  const leagueInfo = AVAILABLE_LEAGUES.find((l) => l.code === league);
  const currentMatchday = standingsData.season.currentMatchday;

  // Fetch favorite team IDs if user is logged in
  let favoriteTeamIds: number[] = [];
  if (session?.user?.id) {
    const favorites = await prisma.favoriteTeam.findMany({
      where: { userId: session.user.id },
      select: { teamId: true },
    });
    favoriteTeamIds = favorites.map((f) => f.teamId);
  }

  return (
    <div className="space-y-6">
      {/* League Info Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center gap-4 p-6">
          {leagueInfo && (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
              <Image
                src={leagueInfo.emblem}
                alt={leagueInfo.name}
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{matchesData.competition.name}</h2>
            {currentMatchday && (
              <p className="text-sm text-muted-foreground">現在: 第{currentMatchday}節</p>
            )}
          </div>
        </CardContent>
      </Card>

      <MatchListWithFilters
        matches={matchesData.matches}
        favoriteTeamIds={favoriteTeamIds}
        currentMatchday={currentMatchday}
        leagueCode={league}
      />
    </div>
  );
}

export default async function MatchesPage({ searchParams }: Props) {
  const { league = DEFAULT_LEAGUE } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8 lg:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">試合一覧</h1>
        </div>
      </div>

      {/* League Selector */}
      <div className="mb-8">
        <Suspense fallback={null}>
          <LeagueSelector basePath="/matches" />
        </Suspense>
      </div>

      {/* Match List */}
      <Suspense fallback={<MatchListSkeleton />}>
        <MatchListWrapper league={league} />
      </Suspense>
    </div>
  );
}
