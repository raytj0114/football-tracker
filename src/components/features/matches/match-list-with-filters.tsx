'use client';

import { useState, useMemo } from 'react';
import { Calendar, List, LayoutGrid, Rows3 } from 'lucide-react';
import type { Match } from '@/types/football-api';
import { MatchList } from './match-list';
import { MatchFilters } from './match-filters';
import { MatchCalendar } from './match-calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useMatchData,
  useListFilters,
  useCalendarFilters,
  useFilteredMatchesForList,
  useFilteredMatchesForCalendar,
  useViewDensity,
} from '@/hooks/use-match-filters';

type ViewMode = 'list' | 'calendar';

interface MatchListWithFiltersProps {
  matches: Match[];
  favoriteTeamIds?: number[];
  currentMatchday?: number | null;
  leagueCode: string;
}

export function MatchListWithFilters({
  matches,
  favoriteTeamIds = [],
  currentMatchday = null,
  leagueCode,
}: MatchListWithFiltersProps) {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // View density (compact/detailed)
  const { density, setDensity, isHydrated } = useViewDensity();

  // Extract data from matches
  const { matchdays, matchdayCounts, teams, leagueFavoriteTeamIds } = useMatchData(
    matches,
    favoriteTeamIds
  );

  // List view filters
  const listFilters = useListFilters(leagueCode);

  // Calendar view filters
  const calendarFilters = useCalendarFilters(leagueCode);

  // Computed values for list view
  const hasTeamFilter = listFilters.selectedTeamIds.length > 0 || listFilters.includeFavorites;

  const filterTeamIds = useMemo(() => {
    const ids = new Set(listFilters.selectedTeamIds);
    if (listFilters.includeFavorites) {
      leagueFavoriteTeamIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [listFilters.selectedTeamIds, listFilters.includeFavorites, leagueFavoriteTeamIds]);

  // Computed values for calendar view
  const calendarFilterTeamIds = useMemo(() => {
    const ids = new Set(calendarFilters.selectedTeamIds);
    if (calendarFilters.includeFavorites) {
      leagueFavoriteTeamIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [calendarFilters.selectedTeamIds, calendarFilters.includeFavorites, leagueFavoriteTeamIds]);

  // Determine which matchday to show (use .at() for safe array access)
  const displayMatchday = listFilters.selectedMatchday ?? currentMatchday ?? matchdays.at(-1);

  // Filtered matches
  const filteredMatchesForList = useFilteredMatchesForList(
    matches,
    displayMatchday,
    filterTeamIds,
    hasTeamFilter
  );

  const filteredMatchesForCalendar = useFilteredMatchesForCalendar(
    matches,
    calendarFilters.selectedDate,
    calendarFilterTeamIds
  );

  // If no matchdays exist (e.g., CL knockout stages), show all matches in list mode
  if (matchdays.length === 0) {
    return (
      <div className="space-y-6">
        <MatchList matches={matches} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode & Density Toggle */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn('gap-2', viewMode !== 'list' && 'hover:bg-transparent')}
          >
            <List className="h-4 w-4" />
            <span>リスト</span>
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={cn('gap-2', viewMode !== 'calendar' && 'hover:bg-transparent')}
          >
            <Calendar className="h-4 w-4" />
            <span>カレンダー</span>
          </Button>
        </div>

        {/* Density Toggle (only show in list mode after hydration) */}
        {viewMode === 'list' && isHydrated && (
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant={density === 'detailed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDensity('detailed')}
              className={cn('gap-2', density !== 'detailed' && 'hover:bg-transparent')}
              title="詳細表示"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">詳細</span>
            </Button>
            <Button
              variant={density === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDensity('compact')}
              className={cn('gap-2', density !== 'compact' && 'hover:bg-transparent')}
              title="コンパクト表示"
            >
              <Rows3 className="h-4 w-4" />
              <span className="hidden sm:inline">コンパクト</span>
            </Button>
          </div>
        )}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <MatchFilters
            matchdays={matchdays}
            currentMatchday={currentMatchday}
            selectedMatchday={listFilters.selectedMatchday}
            onMatchdayChange={listFilters.setSelectedMatchday}
            teams={teams}
            selectedTeamIds={listFilters.selectedTeamIds}
            onTeamFilterChange={listFilters.setSelectedTeamIds}
            includeFavorites={listFilters.includeFavorites}
            onFavoritesFilterChange={listFilters.setIncludeFavorites}
            favoriteTeamIds={leagueFavoriteTeamIds}
            matchdayCounts={matchdayCounts}
          />

          {hasTeamFilter && (
            <p className="text-sm text-muted-foreground">
              第{displayMatchday}節で{filteredMatchesForList.length}件の試合
            </p>
          )}

          <MatchList matches={filteredMatchesForList} density={density} />
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
          <MatchCalendar
            matches={matches}
            teams={teams}
            favoriteTeamIds={leagueFavoriteTeamIds}
            selectedTeamIds={calendarFilters.selectedTeamIds}
            onTeamFilterChange={calendarFilters.setSelectedTeamIds}
            includeFavorites={calendarFilters.includeFavorites}
            onFavoritesFilterChange={calendarFilters.setIncludeFavorites}
            selectedDate={calendarFilters.selectedDate}
            onDateSelect={calendarFilters.setSelectedDate}
          />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              <FormattedDate date={calendarFilters.selectedDate} />
            </h3>
            {filteredMatchesForCalendar.length > 0 ? (
              <MatchList matches={filteredMatchesForCalendar} />
            ) : (
              <p className="text-muted-foreground text-sm py-8 text-center">
                この日の試合はありません
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Helper component for date formatting
function FormattedDate({ date }: { date: Date | null }) {
  const targetDate = date || new Date();
  const today = new Date();
  const isToday =
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear();

  return (
    <>
      {targetDate.getMonth() + 1}月{targetDate.getDate()}日{isToday ? '（今日）' : ''}
    </>
  );
}
