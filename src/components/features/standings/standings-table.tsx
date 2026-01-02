import Image from 'next/image';
import Link from 'next/link';
import type { Standing } from '@/types/football-api';
import { cn } from '@/lib/utils';
import { POSITION_ZONES, type LeagueCode } from '@/lib/football-api/constants';

interface StandingsTableProps {
  standings: Standing[];
  leagueCode?: LeagueCode;
}

export function StandingsTable({ standings, leagueCode = 'PL' }: StandingsTableProps) {
  const zones = POSITION_ZONES[leagueCode];

  const getPositionClass = (position: number) => {
    if (zones.champions.includes(position)) return 'table-row-champions';
    if (zones.europa.includes(position)) return 'table-row-europa';
    if (zones.relegation.includes(position)) return 'table-row-relegation';
    return '';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-sm font-medium text-muted-foreground">
            <th className="sticky left-0 bg-muted/50 px-2 py-3 w-12 text-center">#</th>
            <th className="px-4 py-3 min-w-[200px]">チーム</th>
            <th className="px-3 py-3 text-center w-12">試</th>
            <th className="px-3 py-3 text-center w-12">勝</th>
            <th className="px-3 py-3 text-center w-12">分</th>
            <th className="px-3 py-3 text-center w-12">負</th>
            <th className="px-3 py-3 text-center w-12 hidden sm:table-cell">得</th>
            <th className="px-3 py-3 text-center w-12 hidden sm:table-cell">失</th>
            <th className="px-3 py-3 text-center w-12 hidden sm:table-cell">差</th>
            <th className="px-3 py-3 text-center w-14 font-bold">勝点</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <tr
              key={standing.team.id}
              className={cn(
                'border-b border-border transition-colors hover:bg-muted/30',
                getPositionClass(standing.position)
              )}
            >
              <td className="sticky left-0 bg-card px-2 py-3">
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      'h-4 w-1 rounded-full flex-shrink-0',
                      zones.champions.includes(standing.position) && 'bg-champions',
                      zones.europa.includes(standing.position) && 'bg-europa',
                      zones.relegation.includes(standing.position) && 'bg-relegation',
                      !zones.champions.includes(standing.position) &&
                        !zones.europa.includes(standing.position) &&
                        !zones.relegation.includes(standing.position) &&
                        'bg-transparent'
                    )}
                  />
                  <span className="font-medium tabular-nums w-6 text-center">
                    {standing.position}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <Link href={`/teams/${standing.team.id}`} className="flex items-center gap-3 group">
                  {standing.team.crest && (
                    <Image
                      src={standing.team.crest}
                      alt={standing.team.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain flex-shrink-0"
                    />
                  )}
                  <span className="font-medium group-hover:text-primary transition-colors truncate">
                    {standing.team.name}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-3 text-center tabular-nums">{standing.playedGames}</td>
              <td className="px-3 py-3 text-center tabular-nums text-win font-medium">
                {standing.won}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">{standing.draw}</td>
              <td className="px-3 py-3 text-center tabular-nums text-loss font-medium">
                {standing.lost}
              </td>
              <td className="px-3 py-3 text-center tabular-nums hidden sm:table-cell">
                {standing.goalsFor}
              </td>
              <td className="px-3 py-3 text-center tabular-nums hidden sm:table-cell">
                {standing.goalsAgainst}
              </td>
              <td className="px-3 py-3 text-center tabular-nums hidden sm:table-cell">
                <span
                  className={cn(
                    standing.goalDifference > 0 && 'text-win',
                    standing.goalDifference < 0 && 'text-loss'
                  )}
                >
                  {standing.goalDifference > 0
                    ? `+${standing.goalDifference}`
                    : standing.goalDifference}
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="font-bold text-lg">{standing.points}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        {zones.champions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-champions" />
            <span>Champions League</span>
          </div>
        )}
        {zones.europa.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-europa" />
            <span>Europa League</span>
          </div>
        )}
        {zones.relegation.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-relegation" />
            <span>降格</span>
          </div>
        )}
      </div>
    </div>
  );
}
