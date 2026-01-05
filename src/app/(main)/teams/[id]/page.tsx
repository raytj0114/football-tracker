import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { footballAPI, FootballAPIError } from '@/lib/football-api/client';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import { isFavorite } from '@/app/actions/favorites';
import { auth } from '@/auth';
import { TeamHeader } from '@/components/features/teams/team-header';
import { TeamSquad } from '@/components/features/teams/team-squad';
import { FavoriteButton } from '@/components/features/favorites/favorite-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  params: Promise<{ id: string }>;
}

// 上位チームを事前生成（6リーグ × 上位6チーム = 最大36チーム）
export async function generateStaticParams() {
  const topTeams: { id: string }[] = [];
  const domesticLeagues = AVAILABLE_LEAGUES.filter((l) => l.code !== 'CL');

  for (const league of domesticLeagues) {
    try {
      const standings = await footballAPI.getStandings(league.code);
      const totalStandings = standings.standings.find((s) => s.type === 'TOTAL');
      const top6 = totalStandings?.table.slice(0, 6) ?? [];

      top6.forEach((entry) => {
        topTeams.push({ id: String(entry.team.id) });
      });
    } catch (error) {
      console.error(`Failed to fetch standings for ${league.code}:`, error);
    }
  }

  return topTeams;
}

// 事前生成されていないチームも動的に対応
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId)) {
    return { title: 'チーム詳細 | Football Tracker (ベータ版)' };
  }

  try {
    const team = await footballAPI.getTeam(teamId);
    return {
      title: `${team.name} | Football Tracker (ベータ版)`,
      description: `${team.name}の詳細情報、選手一覧を確認できます`,
    };
  } catch {
    return { title: 'チーム詳細 | Football Tracker (ベータ版)' };
  }
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId)) {
    notFound();
  }

  try {
    const [team, session, favoriteStatus] = await Promise.all([
      footballAPI.getTeam(teamId),
      auth(),
      isFavorite(teamId),
    ]);

    const favoriteButton = session ? (
      <FavoriteButton
        teamId={teamId}
        teamName={team.name}
        teamCrest={team.crest}
        initialIsFavorite={favoriteStatus}
      />
    ) : null;

    return (
      <div className="container mx-auto px-4 py-8 lg:px-6">
        {/* Team Header */}
        <TeamHeader team={team} favoriteButton={favoriteButton} />

        {/* Squad Section */}
        {team.squad.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span>選手一覧</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    {team.squad.length}人の選手
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamSquad squad={team.squad} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    if (error instanceof FootballAPIError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
