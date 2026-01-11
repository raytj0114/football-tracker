import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import { TodaysMatches } from '@/components/features/home/todays-matches';
import { FavoriteMatches } from '@/components/features/home/favorite-matches';

function TodaysMatchesSkeleton() {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="overflow-x-hidden">
        <div className="flex gap-3 overflow-x-auto py-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[140px] w-[280px] flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function FavoriteMatchesSkeleton() {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8 overflow-x-hidden">
      {/* Hero Section - Compact on mobile */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 md:p-10">
          <div className="relative z-10">
            <h1 className="mb-3 text-2xl font-bold md:text-3xl lg:text-4xl">
              Football Tracker
              <span className="ml-2 text-base text-muted-foreground md:text-lg">ベータ版</span>
            </h1>
            <p className="mb-6 max-w-xl text-sm text-muted-foreground md:text-base">
              世界のサッカーリーグの試合結果、順位表、チーム情報をリアルタイムで確認
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/matches">
                <Button size="lg" className="gap-2 text-sm md:text-base">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  試合を見る
                </Button>
              </Link>
              <Link href="/standings">
                <Button variant="outline" size="lg" className="gap-2 text-sm md:text-base">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                  順位表を見る
                </Button>
              </Link>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl md:h-64 md:w-64" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl md:h-64 md:w-64" />
        </div>
      </section>

      {/* Today's Matches - Dynamic content */}
      <Suspense fallback={<TodaysMatchesSkeleton />}>
        <TodaysMatches />
      </Suspense>

      {/* Favorite Team Matches - For logged-in users */}
      <Suspense fallback={<FavoriteMatchesSkeleton />}>
        <FavoriteMatches />
      </Suspense>

      {/* Quick League Access - Compact horizontal scroll on mobile */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">リーグを選ぶ</h2>
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="gap-1">
              すべて見る
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="overflow-x-hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible lg:grid-cols-6">
            {AVAILABLE_LEAGUES.map((league) => (
              <Link
                key={league.code}
                href={`/matches?league=${league.code}`}
                className="flex-shrink-0"
              >
                <Card className="w-[140px] transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 md:w-full">
                  <CardContent className="flex flex-col items-center p-4">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1">
                      <Image
                        src={league.emblem}
                        alt={league.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <span className="text-center text-sm font-medium">{league.name}</span>
                    <span className="text-xs text-muted-foreground">{league.country}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
