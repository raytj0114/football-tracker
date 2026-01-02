'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Users, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TeamOption {
  id: number;
  name: string;
  crest: string | null;
}

interface MatchFiltersProps {
  // Matchday filter
  matchdays: number[];
  currentMatchday: number | null;
  selectedMatchday: number | null;
  onMatchdayChange: (matchday: number | null) => void;
  // Team filter (multiple selection)
  teams?: TeamOption[];
  selectedTeamIds: number[];
  onTeamFilterChange: (teamIds: number[]) => void;
  includeFavorites: boolean;
  onFavoritesFilterChange: (include: boolean) => void;
  favoriteTeamIds?: number[];
  // Match counts per matchday
  matchdayCounts?: Record<number, { total: number; live: number; finished: number }>;
}

export function MatchFilters({
  matchdays,
  currentMatchday,
  selectedMatchday,
  onMatchdayChange,
  teams = [],
  selectedTeamIds,
  onTeamFilterChange,
  includeFavorites,
  onFavoritesFilterChange,
  favoriteTeamIds = [],
  matchdayCounts = {},
}: MatchFiltersProps) {
  const hasTeamFilter = selectedTeamIds.length > 0 || includeFavorites;

  const selectedTeams = useMemo(() => {
    return teams.filter((t) => selectedTeamIds.includes(t.id));
  }, [teams, selectedTeamIds]);

  const toggleTeam = (teamId: number) => {
    if (selectedTeamIds.includes(teamId)) {
      onTeamFilterChange(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      onTeamFilterChange([...selectedTeamIds, teamId]);
    }
  };

  const clearTeamFilter = () => {
    onTeamFilterChange([]);
    onFavoritesFilterChange(false);
  };

  // Find prev/next matchday
  const sortedMatchdays = [...matchdays].sort((a, b) => a - b);
  const defaultMatchday = sortedMatchdays[0] ?? null;
  const currentIndex = selectedMatchday
    ? sortedMatchdays.indexOf(selectedMatchday)
    : sortedMatchdays.indexOf(currentMatchday ?? defaultMatchday ?? 0);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sortedMatchdays.length - 1;

  const handlePrevMatchday = () => {
    if (hasPrev && currentIndex > 0) {
      const prevMatchday = sortedMatchdays[currentIndex - 1];
      if (prevMatchday !== undefined) {
        onMatchdayChange(prevMatchday);
      }
    }
  };

  const handleNextMatchday = () => {
    if (hasNext && currentIndex < sortedMatchdays.length - 1) {
      const nextMatchday = sortedMatchdays[currentIndex + 1];
      if (nextMatchday !== undefined) {
        onMatchdayChange(nextMatchday);
      }
    }
  };

  const displayMatchday = selectedMatchday ?? currentMatchday ?? defaultMatchday;
  const matchdayInfo = displayMatchday !== null ? matchdayCounts[displayMatchday] : null;

  const getTeamFilterLabel = () => {
    if (includeFavorites && selectedTeamIds.length === 0) {
      return 'お気に入り';
    }
    if (selectedTeamIds.length === 0) {
      return 'すべて';
    }
    if (selectedTeamIds.length === 1 && selectedTeams[0]) {
      return selectedTeams[0].name;
    }
    return `${selectedTeamIds.length}チーム`;
  };

  return (
    <div className="space-y-4">
      {/* Matchday Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMatchday}
          disabled={!hasPrev}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-lg font-semibold">
                第{displayMatchday}節
                {matchdayInfo && matchdayInfo.live > 0 && (
                  <Badge variant="live" className="ml-1">
                    LIVE {matchdayInfo.live}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto">
              <DropdownMenuLabel>節を選択</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortedMatchdays.map((md) => {
                const info = matchdayCounts[md];
                const isCurrent = md === currentMatchday;
                return (
                  <DropdownMenuItem
                    key={md}
                    onClick={() => onMatchdayChange(md)}
                    className={md === displayMatchday ? 'bg-accent' : ''}
                  >
                    <span className="flex-1">
                      第{md}節{isCurrent && ' (今節)'}
                    </span>
                    {info && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {info.finished}/{info.total}
                      </span>
                    )}
                    {info && info.live > 0 && (
                      <Badge variant="live" className="ml-1 text-xs">
                        LIVE
                      </Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {matchdayInfo && (
            <p className="text-xs text-muted-foreground">
              {matchdayInfo.finished}/{matchdayInfo.total} 試合終了
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMatchday}
          disabled={!hasNext}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Team Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={hasTeamFilter ? 'default' : 'outline'} size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">チーム:</span>
              <span className="max-w-[120px] truncate">{getTeamFilterLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>チームフィルタ（複数選択可）</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {favoriteTeamIds.length > 0 && (
              <>
                <DropdownMenuItem
                  onClick={() => onFavoritesFilterChange(!includeFavorites)}
                  className={includeFavorites ? 'bg-accent' : ''}
                >
                  <Heart
                    className={cn(
                      'mr-2 h-4 w-4',
                      includeFavorites ? 'text-destructive fill-destructive' : 'text-destructive'
                    )}
                  />
                  <span className="flex-1">お気に入りチーム</span>
                  <Badge variant="secondary" className="ml-2">
                    {favoriteTeamIds.length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <div className="max-h-56 overflow-y-auto">
              {teams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.id);
                const isFavorite = favoriteTeamIds.includes(team.id);
                return (
                  <DropdownMenuItem
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    className={isSelected ? 'bg-accent' : ''}
                  >
                    {team.crest && (
                      <Image
                        src={team.crest}
                        alt={team.name}
                        width={20}
                        height={20}
                        className="mr-2 h-5 w-5 object-contain"
                      />
                    )}
                    <span className="truncate flex-1">{team.name}</span>
                    {isFavorite && (
                      <Heart className="ml-2 h-3 w-3 text-destructive fill-destructive" />
                    )}
                    {isSelected && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        選択中
                      </Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Selected teams chips */}
        {selectedTeams.map((team) => (
          <Badge key={team.id} variant="secondary" className="gap-1 pr-1">
            {team.crest && (
              <Image
                src={team.crest}
                alt={team.name}
                width={14}
                height={14}
                className="h-3.5 w-3.5 object-contain"
              />
            )}
            <span className="max-w-[80px] truncate">{team.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => toggleTeam(team.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {includeFavorites && (
          <Badge variant="secondary" className="gap-1 pr-1">
            <Heart className="h-3 w-3 text-destructive fill-destructive" />
            <span>お気に入り</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onFavoritesFilterChange(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {/* Clear all */}
        {hasTeamFilter && (
          <Button variant="ghost" size="sm" onClick={clearTeamFilter}>
            クリア
          </Button>
        )}
      </div>
    </div>
  );
}
