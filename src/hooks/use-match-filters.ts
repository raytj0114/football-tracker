'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Match } from '@/types/football-api';
import type { TeamOption } from '@/components/features/matches/match-filters';

// ============================================
// Types
// ============================================

export type ViewDensity = 'compact' | 'detailed';

export interface MatchdayCounts {
  total: number;
  live: number;
  finished: number;
}

export interface MatchDataResult {
  matchdays: number[];
  matchdayCounts: Record<number, MatchdayCounts>;
  teams: TeamOption[];
  leagueFavoriteTeamIds: number[];
}

export interface ListFilterState {
  selectedMatchday: number | null;
  selectedTeamIds: number[];
  includeFavorites: boolean;
}

export interface ListFilterActions {
  setSelectedMatchday: (matchday: number | null) => void;
  setSelectedTeamIds: (teamIds: number[]) => void;
  setIncludeFavorites: (include: boolean) => void;
  resetFilters: () => void;
}

export interface CalendarFilterState {
  selectedDate: Date | null;
  selectedTeamIds: number[];
  includeFavorites: boolean;
}

export interface CalendarFilterActions {
  setSelectedDate: (date: Date | null) => void;
  setSelectedTeamIds: (teamIds: number[]) => void;
  setIncludeFavorites: (include: boolean) => void;
  resetFilters: () => void;
}

// ============================================
// useMatchData - Extract data from matches
// ============================================

export function useMatchData(matches: Match[], favoriteTeamIds: number[]): MatchDataResult {
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
    const counts: Record<number, MatchdayCounts> = {};
    matches.forEach((match) => {
      if (match.matchday === null) return;
      const md = match.matchday;
      if (!counts[md]) {
        counts[md] = { total: 0, live: 0, finished: 0 };
      }
      const entry = counts[md];
      if (entry) {
        entry.total++;
        if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
          entry.live++;
        }
        if (match.status === 'FINISHED') {
          entry.finished++;
        }
      }
    });
    return counts;
  }, [matches]);

  // Extract unique teams from matches
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

  return {
    matchdays,
    matchdayCounts,
    teams,
    leagueFavoriteTeamIds,
  };
}

// ============================================
// useListFilters - List view filter state
// ============================================

export function useListFilters(leagueCode: string): ListFilterState & ListFilterActions {
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [includeFavorites, setIncludeFavorites] = useState(false);

  // Reset filters when league changes
  const [prevLeagueCode, setPrevLeagueCode] = useState(leagueCode);
  if (leagueCode !== prevLeagueCode) {
    setPrevLeagueCode(leagueCode);
    setSelectedMatchday(null);
    setSelectedTeamIds([]);
    setIncludeFavorites(false);
  }

  const resetFilters = useCallback(() => {
    setSelectedMatchday(null);
    setSelectedTeamIds([]);
    setIncludeFavorites(false);
  }, []);

  return {
    selectedMatchday,
    selectedTeamIds,
    includeFavorites,
    setSelectedMatchday,
    setSelectedTeamIds,
    setIncludeFavorites,
    resetFilters,
  };
}

// ============================================
// useCalendarFilters - Calendar view filter state
// ============================================

export function useCalendarFilters(
  leagueCode: string
): CalendarFilterState & CalendarFilterActions {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [includeFavorites, setIncludeFavorites] = useState(false);

  // Reset filters when league changes
  const [prevLeagueCode, setPrevLeagueCode] = useState(leagueCode);
  if (leagueCode !== prevLeagueCode) {
    setPrevLeagueCode(leagueCode);
    setSelectedDate(null);
    setSelectedTeamIds([]);
    setIncludeFavorites(false);
  }

  const resetFilters = useCallback(() => {
    setSelectedDate(null);
    setSelectedTeamIds([]);
    setIncludeFavorites(false);
  }, []);

  return {
    selectedDate,
    selectedTeamIds,
    includeFavorites,
    setSelectedDate,
    setSelectedTeamIds,
    setIncludeFavorites,
    resetFilters,
  };
}

// ============================================
// useFilteredMatches - Filter matches based on criteria
// ============================================

export function useFilteredMatchesForList(
  matches: Match[],
  displayMatchday: number | null | undefined,
  filterTeamIds: number[],
  hasTeamFilter: boolean
): Match[] {
  return useMemo(() => {
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
}

export function useFilteredMatchesForCalendar(
  matches: Match[],
  selectedDate: Date | null,
  calendarFilterTeamIds: number[]
): Match[] {
  return useMemo(() => {
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
}

// ============================================
// useViewDensity - View density toggle with localStorage persistence
// ============================================

const VIEW_DENSITY_STORAGE_KEY = 'matchViewDensity';

export function useViewDensity(): {
  density: ViewDensity;
  setDensity: (density: ViewDensity) => void;
  isHydrated: boolean;
} {
  const [density, setDensityState] = useState<ViewDensity>('detailed');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(VIEW_DENSITY_STORAGE_KEY);
    if (stored === 'compact' || stored === 'detailed') {
      setDensityState(stored);
    }
    setIsHydrated(true);
  }, []);

  const setDensity = useCallback((newDensity: ViewDensity) => {
    setDensityState(newDensity);
    localStorage.setItem(VIEW_DENSITY_STORAGE_KEY, newDensity);
  }, []);

  return { density, setDensity, isHydrated };
}
