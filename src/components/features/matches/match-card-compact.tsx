'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Match, MatchTeam } from '@/types/football-api';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import { getMatchStatusLabel, getMatchStatusVariant } from '@/lib/football-api/constants';
import { cn } from '@/lib/utils';

interface MatchCardCompactProps {
  match: Match;
  /** ホームチームの順位 */
  homePosition?: number;
  /** アウェイチームの順位 */
  awayPosition?: number;
}

function TeamDisplay({
  team,
  isWinner,
  isFinished,
  isHome,
  position,
}: {
  team: MatchTeam;
  isWinner: boolean;
  isFinished: boolean;
  isHome: boolean;
  position?: number;
}) {
  const teamName = team.shortName || team.name || 'TBD';
  const isTBD = team.id === null;

  const content = (
    <div
      className={cn('flex items-center gap-2 min-w-0', isHome ? 'flex-row' : 'flex-row-reverse')}
    >
      {team.crest ? (
        <Image
          src={team.crest}
          alt={teamName}
          width={20}
          height={20}
          className="h-5 w-5 object-contain flex-shrink-0"
        />
      ) : (
        <div className="flex h-5 w-5 items-center justify-center rounded bg-muted flex-shrink-0">
          <span className="text-[10px] font-medium text-muted-foreground">
            {isTBD ? '?' : teamName.charAt(0)}
          </span>
        </div>
      )}
      <div className={cn('flex items-center gap-1.5 min-w-0', !isHome && 'flex-row-reverse')}>
        {position !== undefined && (
          <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
            {position}位
          </span>
        )}
        <span
          className={cn(
            'text-sm font-medium truncate transition-colors',
            !isTBD && 'group-hover:text-primary',
            isTBD && 'text-muted-foreground',
            isFinished && isWinner && 'text-win'
          )}
        >
          {teamName}
        </span>
      </div>
    </div>
  );

  if (isTBD) {
    return <div className="min-w-0 flex-1">{content}</div>;
  }

  return (
    <Link href={`/teams/${team.id}`} className="group min-w-0 flex-1">
      {content}
    </Link>
  );
}

export function MatchCardCompact({ match, homePosition, awayPosition }: MatchCardCompactProps) {
  const { homeTeam, awayTeam, score, status, utcDate } = match;
  const isFinished = status === 'FINISHED';
  const isLive = status === 'IN_PLAY' || status === 'PAUSED';

  const homeWins =
    isFinished &&
    score.fullTime.home !== null &&
    score.fullTime.away !== null &&
    score.fullTime.home > score.fullTime.away;

  const awayWins =
    isFinished &&
    score.fullTime.home !== null &&
    score.fullTime.away !== null &&
    score.fullTime.away > score.fullTime.home;

  const homeScore = isFinished || isLive ? (score.fullTime.home ?? 0) : null;
  const awayScore = isFinished || isLive ? (score.fullTime.away ?? 0) : null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm',
        isLive && 'ring-2 ring-live/50'
      )}
    >
      {/* Home Team */}
      <TeamDisplay
        team={homeTeam}
        isWinner={homeWins}
        isFinished={isFinished}
        isHome={true}
        position={homePosition}
      />

      {/* Score */}
      <div
        className={cn(
          'flex items-center justify-center gap-1 px-2 py-1 rounded-md min-w-[60px]',
          isLive ? 'bg-live/10' : 'bg-muted/50'
        )}
      >
        <span
          className={cn(
            'score-display text-base font-bold',
            isLive && 'text-live',
            isFinished && homeWins && 'text-win'
          )}
        >
          {homeScore !== null ? homeScore : '-'}
        </span>
        <span className="text-muted-foreground text-xs">-</span>
        <span
          className={cn(
            'score-display text-base font-bold',
            isLive && 'text-live',
            isFinished && awayWins && 'text-win'
          )}
        >
          {awayScore !== null ? awayScore : '-'}
        </span>
      </div>

      {/* Away Team */}
      <TeamDisplay
        team={awayTeam}
        isWinner={awayWins}
        isFinished={isFinished}
        isHome={false}
        position={awayPosition}
      />

      {/* Time & Status */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <span className="text-xs text-muted-foreground">{formatTime(utcDate)}</span>
        <Badge variant={getMatchStatusVariant(status)} className="text-[10px] px-1.5 py-0.5">
          {isLive && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />}
          {getMatchStatusLabel(status)}
        </Badge>
      </div>
    </div>
  );
}
