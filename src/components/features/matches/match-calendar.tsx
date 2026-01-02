'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, Users, X } from 'lucide-react';
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
import type { Match } from '@/types/football-api';

interface TeamOption {
  id: number;
  name: string;
  crest: string | null;
}

interface DayMatchInfo {
  hasMatches: boolean;
  matchCount: number;
  liveCount: number;
  finishedCount: number;
  scheduledCount: number;
  hasFavorite: boolean;
}

interface MatchCalendarProps {
  matches: Match[];
  teams: TeamOption[];
  favoriteTeamIds: number[];
  selectedTeamIds: number[];
  onTeamFilterChange: (teamIds: number[]) => void;
  includeFavorites: boolean;
  onFavoritesFilterChange: (include: boolean) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function MatchCalendar({
  matches,
  teams,
  favoriteTeamIds,
  selectedTeamIds,
  onTeamFilterChange,
  includeFavorites,
  onFavoritesFilterChange,
  selectedDate,
  onDateSelect,
}: MatchCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const hasTeamFilter = selectedTeamIds.length > 0 || includeFavorites;

  // Get all team IDs to filter for (including favorites if selected)
  const filterTeamIds = useMemo(() => {
    const ids = new Set(selectedTeamIds);
    if (includeFavorites) {
      favoriteTeamIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [selectedTeamIds, includeFavorites, favoriteTeamIds]);

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

  // Filter matches by selected teams
  const filteredMatches = useMemo(() => {
    if (!hasTeamFilter || filterTeamIds.length === 0) {
      return matches;
    }
    return matches.filter(
      (m) =>
        (m.homeTeam.id !== null && filterTeamIds.includes(m.homeTeam.id)) ||
        (m.awayTeam.id !== null && filterTeamIds.includes(m.awayTeam.id))
    );
  }, [matches, hasTeamFilter, filterTeamIds]);

  // Build a map of date -> match info (using filtered matches)
  const matchesByDate = useMemo(() => {
    const map = new Map<string, DayMatchInfo>();

    filteredMatches.forEach((match) => {
      const date = new Date(match.utcDate);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      const existing = map.get(dateKey) || {
        hasMatches: false,
        matchCount: 0,
        liveCount: 0,
        finishedCount: 0,
        scheduledCount: 0,
        hasFavorite: false,
      };

      existing.hasMatches = true;
      existing.matchCount++;

      // Count by status
      if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
        existing.liveCount++;
      } else if (match.status === 'FINISHED') {
        existing.finishedCount++;
      } else {
        existing.scheduledCount++;
      }

      // Check if selected team is playing (for highlight)
      const homeIsSelected =
        match.homeTeam.id !== null && filterTeamIds.includes(match.homeTeam.id);
      const awayIsSelected =
        match.awayTeam.id !== null && filterTeamIds.includes(match.awayTeam.id);

      if (homeIsSelected || awayIsSelected) {
        existing.hasFavorite = true;
      }

      map.set(dateKey, existing);
    });

    return map;
  }, [filteredMatches, filterTeamIds]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      matchInfo: DayMatchInfo | null;
    }> = [];

    // Previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        matchInfo: matchesByDate.get(dateKey) || null,
      });
    }

    // Current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        matchInfo: matchesByDate.get(dateKey) || null,
      });
    }

    // Next month
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        matchInfo: matchesByDate.get(dateKey) || null,
      });
    }

    return days;
  }, [currentMonth, matchesByDate]);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    onDateSelect(now);
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (date: Date, hasMatches: boolean) => {
    if (!hasMatches) return;
    if (isSelectedDate(date)) {
      onDateSelect(null);
    } else {
      onDateSelect(date);
    }
  };

  // Summary stats
  const monthStats = useMemo(() => {
    let totalMatches = 0;
    let matchDays = 0;
    let liveMatches = 0;

    calendarDays.forEach(({ isCurrentMonth, matchInfo }) => {
      if (isCurrentMonth && matchInfo) {
        totalMatches += matchInfo.matchCount;
        matchDays++;
        liveMatches += matchInfo.liveCount;
      }
    });

    return { totalMatches, matchDays, liveMatches };
  }, [calendarDays]);

  return (
    <div className="space-y-4">
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

      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs h-7">
              今日
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month summary */}
        <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-xs">
          <span className="text-muted-foreground">
            {hasTeamFilter ? `${monthStats.matchDays}日 / ` : ''}
            {monthStats.totalMatches}試合
          </span>
          {monthStats.liveMatches > 0 && (
            <span className="flex items-center gap-1 text-live">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
              </span>
              LIVE {monthStats.liveMatches}
            </span>
          )}
        </div>

        <div className="p-3">
          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  'text-center text-xs font-medium py-1',
                  i === 0 && 'text-destructive',
                  i === 6 && 'text-blue-500'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth, isToday, matchInfo }, index) => {
              const hasMatches = matchInfo?.hasMatches ?? false;
              const hasLive = (matchInfo?.liveCount ?? 0) > 0;
              const isSelected = isSelectedDate(date);
              const dayOfWeek = date.getDay();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date, hasMatches)}
                  disabled={!hasMatches}
                  className={cn(
                    'relative flex flex-col items-center rounded-lg p-1.5 min-h-[4rem] transition-all',
                    'hover:bg-muted/50 disabled:cursor-default disabled:hover:bg-transparent',
                    !isCurrentMonth && 'opacity-30',
                    isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                    isSelected && 'bg-primary/10 ring-2 ring-primary',
                    hasMatches && !isSelected && 'cursor-pointer',
                    hasMatches && hasTeamFilter && !isSelected && !hasLive && 'bg-primary/5',
                    hasLive && !isSelected && 'bg-live/10'
                  )}
                >
                  {/* Date number */}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      !hasMatches && 'opacity-40',
                      dayOfWeek === 0 && 'text-destructive',
                      dayOfWeek === 6 && 'text-blue-500',
                      isSelected && 'text-primary font-bold'
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {/* Match info */}
                  {hasMatches && matchInfo && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      {/* LIVE indicator */}
                      {hasLive ? (
                        <div className="flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                          </span>
                          <span className="text-[10px] font-bold text-live">LIVE</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {matchInfo.matchCount}試合
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom status dots */}
                  {hasMatches && matchInfo && !hasLive && (
                    <div className="flex justify-center gap-1">
                      {matchInfo.finishedCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                      {matchInfo.scheduledCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
            <span>LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>終了</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <span>予定</span>
          </div>
        </div>
      </div>
    </div>
  );
}
