import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { getFavorites } from '@/app/actions/favorites';
import { FavoriteTeamList } from '@/components/features/favorites/favorite-team-list';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'お気に入り | Football Tracker (ベータ版)',
  description: 'お気に入りチームの一覧と試合情報',
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/favorites');
  }

  const favorites = await getFavorites();

  return (
    <div className="container mx-auto px-4 py-8 lg:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">お気に入り</h1>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              お気に入りチームがありません
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              チーム詳細ページでハートボタンを押してお気に入りに追加できます
            </p>
            <div className="flex gap-3">
              <Link href="/standings">
                <Button variant="outline">順位表を見る</Button>
              </Link>
              <Link href="/matches">
                <Button>試合一覧を見る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <p className="mb-6 text-sm text-muted-foreground">
            {favorites.length}チームをお気に入りに登録中
          </p>
          <FavoriteTeamList teams={favorites} />
        </div>
      )}
    </div>
  );
}
