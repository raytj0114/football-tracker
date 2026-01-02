import Image from 'next/image';
import type { TeamDetail } from '@/types/football-api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, User, Calendar, Palette } from 'lucide-react';

interface TeamHeaderProps {
  team: TeamDetail;
  isFavorite?: boolean;
  favoriteButton?: React.ReactNode;
}

export function TeamHeader({ team, favoriteButton }: TeamHeaderProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Team Crest */}
          {team.crest && (
            <div className="flex-shrink-0">
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-xl bg-card p-4 shadow-lg border border-border">
                <Image src={team.crest} alt={team.name} fill className="object-contain p-2" />
              </div>
            </div>
          )}

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{team.name}</h1>
                {team.tla && <p className="mt-1 text-lg text-muted-foreground">{team.tla}</p>}
              </div>
              {favoriteButton}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team.founded && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">創設年</p>
                    <p className="font-semibold">{team.founded}</p>
                  </div>
                </div>
              )}
              {team.venue && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">スタジアム</p>
                    <p className="font-semibold truncate" title={team.venue}>
                      {team.venue}
                    </p>
                  </div>
                </div>
              )}
              {team.coach && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">監督</p>
                    <p className="font-semibold truncate" title={team.coach.name}>
                      {team.coach.name}
                    </p>
                  </div>
                </div>
              )}
              {team.clubColors && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">クラブカラー</p>
                    <p className="font-semibold truncate" title={team.clubColors}>
                      {team.clubColors}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Competitions */}
      {team.runningCompetitions.length > 0 && (
        <CardContent className="border-t border-border">
          <p className="mb-3 text-sm font-medium text-muted-foreground">参加リーグ</p>
          <div className="flex flex-wrap gap-2">
            {team.runningCompetitions.map((comp) => (
              <Badge key={comp.id} variant="secondary">
                {comp.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
