'use client';

import { useState, useMemo } from 'react';
import { Calendar, List } from 'lucide-react';
import type { Match } from '@/types/football-api';
import { MatchList } from './match-list';
import { MatchFilters, type TeamOption } from './match-filters';
import { MatchCalendar } from './match-calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  // List view state
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [includeFavorites, setIncludeFavorites] = useState(false);

  // Calendar view state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarTeamIds, setCalendarTeamIds] = useState<number[]>([]);
  const [calendarIncludeFavorites, setCalendarIncludeFavorites] = useState(false);

  // Reset filters when league changes
  const [prevLeagueCode, setPrevLeagueCode] = useState(leagueCode);
  if (leagueCode !== prevLeagueCode) {
    setPrevLeagueCode(leagueCode);
    setSelectedMatchday(null);
    setSelectedTeamIds([]);
    setIncludeFavorites(false);
    setSelectedDate(null);
    setCalendarTeamIds([]);
    setCalendarIncludeFavorites(false);
  }

  const hasTeamFilter = selectedTeamIds.length > 0 || includeFavorites;

  // Extract unique matchdays from matches
  const matchdays = useMemo(() => {
    const mdSet = new Set<number>();
    matches.forEach((match) => {
      if (match.matchday !== null) {
        mdSet.add(match.matchday);
      }
    });
    return Array.from(mdSet).sort((a, b) => a - b);
  }, [matches]);

  // Calculate match counts per matchday
  const matchdayCounts = useMemo(() => {
    const counts: Record<number, { total: number; live: number; finished: number }> = {};
    matches.forEach((match) => {
      if (match.matchday === null) return;
      const md = match.matchday;
      if (!counts[md]) {
        counts[md] = { total: 0, live: 0, finished: 0 };
      }
      const entry = counts[md];
      entry.total++;
      if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
        entry.live++;
      }
      if (match.status === 'FINISHED') {
        entry.finished++;
      }
    });
    return counts;
  }, [matches]);

  // Determine which matchday to show (default to current matchday)
  const displayMatchday = selectedMatchday ?? currentMatchday ?? matchdays[matchdays.length - 1];

  // Extract unique teams from matches (these are the teams in current league)
  const teams = useMemo(() => {
    const teamMap = new Map<number, TeamOption>();

    matches.forEach((match) => {
      if (match.homeTeam.id !== null) {
        teamMap.set(match.homeTeam.id, {
          id: match.homeTeam.id,
          name: match.homeTeam.name || 'Unknown',
          crest: match.homeTeam.crest,
        });
      }
      if (match.awayTeam.id !== null) {
        teamMap.set(match.awayTeam.id, {
          id: match.awayTeam.id,
          name: match.awayTeam.name || 'Unknown',
          crest: match.awayTeam.crest,
        });
      }
    });

    return Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [matches]);

  // Filter favorite team IDs to only include teams in current league
  const leagueFavoriteTeamIds = useMemo(() => {
    const leagueTeamIds = new Set(teams.map((t) => t.id));
    return favoriteTeamIds.filter((id) => leagueTeamIds.has(id));
  }, [teams, favoriteTeamIds]);

  // Get all team IDs to filter for list view (including favorites if selected)
  const filterTeamIds = useMemo(() => {
    const ids = new Set(selectedTeamIds);
    if (includeFavorites) {
      leagueFavoriteTeamIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [selectedTeamIds, includeFavorites, leagueFavoriteTeamIds]);

  // Get all team IDs to filter for calendar view
  const calendarFilterTeamIds = useMemo(() => {
    const ids = new Set(calendarTeamIds);
    if (calendarIncludeFavorites) {
      leagueFavoriteTeamIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [calendarTeamIds, calendarIncludeFavorites, leagueFavoriteTeamIds]);

  // Filter matches for list view - matchday first, then team filter within matchday
  const filteredMatchesForList = useMemo(() => {
    let result = [...matches];

    // Always apply matchday filter first
    if (displayMatchday !== null && displayMatchday !== undefined) {
      result = result.filter((m) => m.matchday === displayMatchday);
    }

    // Then apply team filter within the matchday
    if (hasTeamFilter && filterTeamIds.length > 0) {
      result = result.filter(
        (m) =>
          (m.homeTeam.id !== null && filterTeamIds.includes(m.homeTeam.id)) ||
          (m.awayTeam.id !== null && filterTeamIds.includes(m.awayTeam.id))
      );
    }

    // Sort by date (ascending)
    result.sort((a, b) => {
      const dateA = new Date(a.utcDate).getTime();
      const dateB = new Date(b.utcDate).getTime();
      return dateA - dateB;
    });

    return result;
  }, [matches, displayMatchday, hasTeamFilter, filterTeamIds]);

  // Filter matches for calendar view (by selected date and team filter)
  const filteredMatchesForCalendar = useMemo(() => {
    let result = [...matches];

    // Apply team filter if active
    if (calendarFilterTeamIds.length > 0) {
      result = result.filter(
        (m) =>
          (m.homeTeam.id !== null && calendarFilterTeamIds.includes(m.homeTeam.id)) ||
          (m.awayTeam.id !== null && calendarFilterTeamIds.includes(m.awayTeam.id))
      );
    }

    // Then filter by date
    const targetDate = selectedDate || new Date();
    result = result.filter((m) => {
      const matchDate = new Date(m.utcDate);
      return (
        matchDate.getDate() === targetDate.getDate() &&
        matchDate.getMonth() === targetDate.getMonth() &&
        matchDate.getFullYear() === targetDate.getFullYear()
      );
    });

    return result.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  }, [matches, selectedDate, calendarFilterTeamIds]);

  // If no matchdays exist (e.g., CL knockout stages), show all matches in list mode
  if (matchdays.length === 0) {
    return (
      <div className="space-y-6">
        <MatchList matches={matches} />
      </div>
    );
  }

  const formatSelectedDate = (date: Date | null) => {
    if (!date) {
      const today = new Date();
      return `${today.getMonth() + 1}月${today.getDate()}日（今日）`;
    }
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    return `${date.getMonth() + 1}月${date.getDate()}日${isToday ? '（今日）' : ''}`;
  };

  return (
    <div className="space-y-6">
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

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <MatchFilters
            matchdays={matchdays}
            currentMatchday={currentMatchday}
            selectedMatchday={selectedMatchday}
            onMatchdayChange={setSelectedMatchday}
            teams={teams}
            selectedTeamIds={selectedTeamIds}
            onTeamFilterChange={setSelectedTeamIds}
            includeFavorites={includeFavorites}
            onFavoritesFilterChange={setIncludeFavorites}
            favoriteTeamIds={leagueFavoriteTeamIds}
            matchdayCounts={matchdayCounts}
          />

          {hasTeamFilter && (
            <p className="text-sm text-muted-foreground">
              第{displayMatchday}節で{filteredMatchesForList.length}件の試合
            </p>
          )}

          <MatchList matches={filteredMatchesForList} />
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
          <MatchCalendar
            matches={matches}
            teams={teams}
            favoriteTeamIds={leagueFavoriteTeamIds}
            selectedTeamIds={calendarTeamIds}
            onTeamFilterChange={setCalendarTeamIds}
            includeFavorites={calendarIncludeFavorites}
            onFavoritesFilterChange={setCalendarIncludeFavorites}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{formatSelectedDate(selectedDate)}</h3>
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
