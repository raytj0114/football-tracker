import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
import { footballAPI } from '@/lib/football-api/client';
import { DEFAULT_LEAGUE, type LeagueCode } from '@/lib/football-api/constants';
import { StandingsTable } from '@/components/features/standings/standings-table';
import { LeagueSelector } from '@/components/features/matches/league-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '順位表 | Football Tracker (ベータ版)',
  description: 'サッカーリーグの順位表を確認できます',
};

interface Props {
  searchParams: Promise<{ league?: string }>;
}

function StandingsTableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full rounded-t-xl" />
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
      <Skeleton className="h-10 w-full rounded-b-xl" />
    </div>
  );
}

async function StandingsWrapper({ league }: { league: string }) {
  const data = await footballAPI.getStandings(league);
  const totalStandings = data.standings.find((s) => s.type === 'TOTAL');

  if (!totalStandings) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">順位表データがありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competition Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            {data.competition.emblem && (
              <div className="relative h-16 w-16 rounded-lg bg-white p-2 shadow-sm">
                <Image
                  src={data.competition.emblem}
                  alt={data.competition.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
            <div>
              <span className="text-xl">{data.competition.name}</span>
              {data.season.currentMatchday && (
                <Badge variant="secondary" className="mt-2 block w-fit">
                  第{data.season.currentMatchday}節
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Standings Table */}
      <StandingsTable standings={totalStandings.table} leagueCode={league as LeagueCode} />
    </div>
  );
}

export default async function StandingsPage({ searchParams }: Props) {
  const { league = DEFAULT_LEAGUE } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8 lg:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">順位表</h1>
        </div>
      </div>

      {/* League Selector */}
      <div className="mb-8">
        <Suspense fallback={null}>
          <LeagueSelector basePath="/standings" />
        </Suspense>
      </div>

      {/* Standings */}
      <Suspense fallback={<StandingsTableSkeleton />}>
        <StandingsWrapper league={league} />
      </Suspense>
    </div>
  );
}
