'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Standing } from '@/types/football-api';
import { cn } from '@/lib/utils';
import { POSITION_ZONES, type LeagueCode } from '@/lib/football-api/constants';
import { TeamCommentPopover } from './team-comment-popover';

interface StandingsTableProps {
  standings: Standing[];
  leagueCode?: LeagueCode;
  matchday?: number | null;
}

export function StandingsTable({ standings, leagueCode = 'PL', matchday }: StandingsTableProps) {
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
          <tr className="border-b border-border bg-muted/50 text-left text-xs sm:text-sm font-medium text-muted-foreground">
            <th className="sticky left-0 bg-muted/50 px-1 sm:px-2 py-2 sm:py-3 w-10 sm:w-12 text-center">
              #
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 min-w-[100px] sm:min-w-[180px]">チーム</th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12">試</th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12">勝</th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12 hidden xs:table-cell">
              分
            </th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12 hidden xs:table-cell">
              負
            </th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12 hidden md:table-cell">
              得
            </th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12 hidden md:table-cell">
              失
            </th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-8 sm:w-12 hidden sm:table-cell">
              差
            </th>
            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center w-10 sm:w-14 font-bold">点</th>
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
              <td className="sticky left-0 bg-card px-1 sm:px-2 py-2 sm:py-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div
                    className={cn(
                      'h-3 sm:h-4 w-1 rounded-full flex-shrink-0',
                      zones.champions.includes(standing.position) && 'bg-champions',
                      zones.europa.includes(standing.position) && 'bg-europa',
                      zones.relegation.includes(standing.position) && 'bg-relegation',
                      !zones.champions.includes(standing.position) &&
                        !zones.europa.includes(standing.position) &&
                        !zones.relegation.includes(standing.position) &&
                        'bg-transparent'
                    )}
                  />
                  <span className="font-medium tabular-nums w-5 sm:w-6 text-center text-xs sm:text-sm">
                    {standing.position}
                  </span>
                </div>
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href={`/teams/${standing.team.id}`}
                    className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1"
                  >
                    {standing.team.crest && (
                      <Image
                        src={standing.team.crest}
                        alt={standing.team.name}
                        width={24}
                        height={24}
                        className="h-5 w-5 sm:h-6 sm:w-6 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="font-medium group-hover:text-primary transition-colors truncate text-xs sm:text-sm max-w-[80px] sm:max-w-none">
                      {standing.team.shortName || standing.team.name}
                    </span>
                  </Link>
                  <TeamCommentPopover
                    teamData={{
                      teamId: standing.team.id,
                      teamName: standing.team.name,
                      position: standing.position,
                      playedGames: standing.playedGames,
                      won: standing.won,
                      draw: standing.draw,
                      lost: standing.lost,
                      points: standing.points,
                      goalDifference: standing.goalDifference,
                      leagueCode,
                      matchday: matchday ?? null,
                      // リーグ文脈データ
                      leaderPoints: standings[0]?.points ?? 0,
                      pointsFromLeader: (standings[0]?.points ?? 0) - standing.points,
                      // CLの場合は24位（プレーオフ圏境界）、他リーグは降格圏の勝ち点
                      relegationPoints:
                        leagueCode === 'CL'
                          ? (standings[23]?.points ?? 0)
                          : (standings[standings.length - 3]?.points ?? 0),
                      pointsFromRelegation:
                        leagueCode === 'CL'
                          ? standing.points - (standings[23]?.points ?? 0)
                          : standing.points - (standings[standings.length - 3]?.points ?? 0),
                      totalTeams: standings.length,
                    }}
                  />
                </div>
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-xs sm:text-sm">
                {standing.playedGames}
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-win font-medium text-xs sm:text-sm">
                {standing.won}
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-xs sm:text-sm hidden xs:table-cell">
                {standing.draw}
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-loss font-medium text-xs sm:text-sm hidden xs:table-cell">
                {standing.lost}
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-xs sm:text-sm hidden md:table-cell">
                {standing.goalsFor}
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-xs sm:text-sm hidden md:table-cell">
                {standing.goalsAgainst}
              </td>
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center tabular-nums text-xs sm:text-sm hidden sm:table-cell">
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
              <td className="px-1 sm:px-3 py-2 sm:py-3 text-center">
                <span className="font-bold text-sm sm:text-lg">{standing.points}</span>
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
