import Image from 'next/image';
import Link from 'next/link';
import type { Match, MatchTeam } from '@/types/football-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDateTime, formatTime } from '@/lib/utils';
import { getMatchStatusLabel, getMatchStatusVariant } from '@/lib/football-api/constants';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
  /** グループヘッダーで日付を表示している場合はfalseにして時刻のみ表示 */
  showDateInHeader?: boolean;
}

function TeamRow({
  team,
  scoreValue,
  isWinner,
  isLive,
  isFinished,
}: {
  team: MatchTeam;
  scoreValue: number | null;
  isWinner: boolean;
  isLive: boolean;
  isFinished: boolean;
}) {
  const teamName = team.shortName || team.name || 'TBD';
  const isTBD = team.id === null;

  const content = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {team.crest ? (
          <Image
            src={team.crest}
            alt={teamName}
            width={32}
            height={32}
            className="h-8 w-8 object-contain flex-shrink-0"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground">
              {isTBD ? '?' : teamName.charAt(0)}
            </span>
          </div>
        )}
        <span
          className={cn(
            'font-medium transition-colors',
            !isTBD && 'group-hover:text-primary',
            isTBD && 'text-muted-foreground'
          )}
        >
          {teamName}
        </span>
      </div>
      <span
        className={cn(
          'score-display text-xl',
          isLive && 'text-live',
          isFinished && isWinner && 'text-win'
        )}
      >
        {isFinished || isLive ? (scoreValue ?? 0) : '-'}
      </span>
    </div>
  );

  if (isTBD) {
    return <div className="py-1">{content}</div>;
  }

  return (
    <Link href={`/teams/${team.id}`} className="group block">
      {content}
    </Link>
  );
}

export function MatchCard({ match, showDateInHeader = true }: MatchCardProps) {
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

  // グループヘッダーに日付がある場合は時刻のみ、なければ日時全体を表示
  const displayTime = showDateInHeader ? formatDateTime(utcDate) : formatTime(utcDate);

  return (
    <Card className={cn('overflow-hidden card-hover', isLive && 'ring-2 ring-live/50')}>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{displayTime}</span>
          <Badge variant={getMatchStatusVariant(status)}>
            {isLive && <span className="mr-1.5 h-2 w-2 rounded-full bg-white animate-pulse-live" />}
            {getMatchStatusLabel(status)}
          </Badge>
        </div>

        {/* Teams and Score */}
        <div className="space-y-3">
          <TeamRow
            team={homeTeam}
            scoreValue={score.fullTime.home}
            isWinner={homeWins}
            isLive={isLive}
            isFinished={isFinished}
          />
          <TeamRow
            team={awayTeam}
            scoreValue={score.fullTime.away}
            isWinner={awayWins}
            isLive={isLive}
            isFinished={isFinished}
          />
        </div>
      </div>
    </Card>
  );
}
