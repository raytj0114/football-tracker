import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Trophy, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:px-6">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 md:p-12">
          <div className="relative z-10">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">Football Tracker</h1>
            <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
              世界のサッカーリーグの試合結果、順位表、チーム情報をリアルタイムで確認できます
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/matches">
                <Button size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  試合を見る
                </Button>
              </Link>
              <Link href="/standings">
                <Button variant="outline" size="lg" className="gap-2">
                  <Trophy className="h-5 w-5" />
                  順位表を見る
                </Button>
              </Link>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="対応リーグ"
          value={AVAILABLE_LEAGUES.length}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="機能"
          value="試合・順位・チーム"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard title="データ更新" value="リアルタイム" icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="選手情報" value="全チーム対応" icon={<Users className="h-5 w-5" />} />
      </div>

      {/* Leagues Section */}
      <div>
        <h2 className="mb-6 text-xl font-semibold">対応リーグ</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AVAILABLE_LEAGUES.map((league) => (
            <Card key={league.code} className="card-hover group">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1">
                    <Image
                      src={league.emblem}
                      alt={league.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <span>{league.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">{league.country}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/matches?league=${league.code}`}>
                    <Button variant="secondary" size="sm">
                      試合
                    </Button>
                  </Link>
                  <Link href={`/standings?league=${league.code}`}>
                    <Button variant="ghost" size="sm">
                      順位表
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
