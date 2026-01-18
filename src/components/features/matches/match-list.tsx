import type { Match } from '@/types/football-api';
import type { ViewDensity } from '@/hooks/use-match-filters';
import { MatchCard } from './match-card';
import { MatchCardCompact } from './match-card-compact';
import { formatDate, formatRelativeDateWithWeekday } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type GroupBy = 'date' | 'matchday';

interface MatchListProps {
  matches: Match[];
  groupBy?: GroupBy;
  currentMatchday?: number | null;
  /** 表示密度: 'detailed'（従来のカード）または 'compact'（1行表示） */
  density?: ViewDensity;
  /** チームID → 順位のマップ */
  teamPositionMap?: Map<number, number>;
}

export function MatchList({
  matches,
  groupBy = 'date',
  currentMatchday = null,
  density = 'detailed',
  teamPositionMap,
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">試合が見つかりませんでした</p>
        <p className="mt-1 text-sm text-muted-foreground">別のリーグや期間を選択してください</p>
      </div>
    );
  }

  // Separate live matches
  const liveMatches = matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const otherMatches = matches.filter((m) => m.status !== 'IN_PLAY' && m.status !== 'PAUSED');

  // Group matches based on groupBy mode
  const groupedMatches =
    groupBy === 'matchday'
      ? groupByMatchday(otherMatches, currentMatchday)
      : groupByDate(otherMatches);

  const isCompact = density === 'compact';

  // Grid classes: compact mode uses single column for 1-line cards
  const gridClasses = cn('grid gap-4', isCompact ? 'grid-cols-1' : 'md:grid-cols-2');

  return (
    <div className="space-y-8">
      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-live" />
            </span>
            <h3 className="text-lg font-semibold text-live">ライブ</h3>
          </div>
          <div className={gridClasses}>
            {liveMatches.map((match) =>
              isCompact ? (
                <MatchCardCompact
                  key={match.id}
                  match={match}
                  homePosition={
                    match.homeTeam.id ? teamPositionMap?.get(match.homeTeam.id) : undefined
                  }
                  awayPosition={
                    match.awayTeam.id ? teamPositionMap?.get(match.awayTeam.id) : undefined
                  }
                />
              ) : (
                <MatchCard
                  key={match.id}
                  match={match}
                  showDateInHeader={false}
                  homePosition={
                    match.homeTeam.id ? teamPositionMap?.get(match.homeTeam.id) : undefined
                  }
                  awayPosition={
                    match.awayTeam.id ? teamPositionMap?.get(match.awayTeam.id) : undefined
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Grouped Matches */}
      {groupedMatches.map(({ key, label, matches: groupMatches }) => (
        <div key={key}>
          <h3 className="mb-4 text-base font-semibold text-muted-foreground">{label}</h3>
          <div className={gridClasses}>
            {groupMatches.map((match) =>
              isCompact ? (
                <MatchCardCompact
                  key={match.id}
                  match={match}
                  homePosition={
                    match.homeTeam.id ? teamPositionMap?.get(match.homeTeam.id) : undefined
                  }
                  awayPosition={
                    match.awayTeam.id ? teamPositionMap?.get(match.awayTeam.id) : undefined
                  }
                />
              ) : (
                <MatchCard
                  key={match.id}
                  match={match}
                  showDateInHeader={false}
                  homePosition={
                    match.homeTeam.id ? teamPositionMap?.get(match.homeTeam.id) : undefined
                  }
                  awayPosition={
                    match.awayTeam.id ? teamPositionMap?.get(match.awayTeam.id) : undefined
                  }
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(matches: Match[]): Array<{ key: string; label: string; matches: Match[] }> {
  const groups: Record<string, Match[]> = {};

  matches.forEach((match) => {
    const date = new Date(match.utcDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(match);
  });

  // Sort by date
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, dateMatches]) => ({
      key: date,
      label: formatRelativeDateWithWeekday(date),
      matches: dateMatches,
    }));
}

function groupByMatchday(
  matches: Match[],
  currentMatchday: number | null
): Array<{ key: string; label: string; matches: Match[] }> {
  const groups: Record<number, Match[]> = {};

  matches.forEach((match) => {
    const md = match.matchday ?? 0;
    if (!groups[md]) {
      groups[md] = [];
    }
    groups[md].push(match);
  });

  const entries = Object.entries(groups);
  const current = currentMatchday ?? Math.max(...entries.map(([k]) => Number(k)));

  // Sort: current matchday first, then all matchdays in order (1, 2, 3, ...)
  const sorted = entries.sort(([a], [b]) => {
    const mdA = Number(a);
    const mdB = Number(b);

    // Current matchday comes first
    if (mdA === current && mdB !== current) return -1;
    if (mdB === current && mdA !== current) return 1;

    // Otherwise sort ascending (1, 2, 3, ...)
    return mdA - mdB;
  });

  return sorted.map(([md, mdMatches]) => {
    // Sort matches within matchday by date
    const sortedMatches = mdMatches.sort(
      (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    );

    // Get date range for display
    const dates = sortedMatches.map((m) => new Date(m.utcDate));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const dateRangeStr =
      minDate.toDateString() === maxDate.toDateString()
        ? formatDate(minDate)
        : `${formatDate(minDate)} - ${formatDate(maxDate)}`;

    const matchdayNum = Number(md);
    const isCurrent = matchdayNum === current;

    return {
      key: `matchday-${md}`,
      label:
        matchdayNum === 0
          ? `その他（${dateRangeStr}）`
          : `第${md}節${isCurrent ? '（今節）' : ''}（${dateRangeStr}）`,
      matches: sortedMatches,
    };
  });
}
