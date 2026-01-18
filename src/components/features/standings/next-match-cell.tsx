'use client';

import Image from 'next/image';
import type { NextMatchInfo } from './standings-table';

interface NextMatchCellProps {
  nextMatch: NextMatchInfo | undefined;
}

/**
 * Format date to short format (e.g., "1/25")
 */
function formatShortDate(utcDate: string): string {
  const date = new Date(utcDate);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function NextMatchCell({ nextMatch }: NextMatchCellProps) {
  if (!nextMatch) {
    return <span className="text-xs text-muted-foreground/50">-</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Home/Away indicator */}
      <span className="text-[10px] text-muted-foreground font-medium w-4 flex-shrink-0">
        {nextMatch.isHome ? 'vs' : '@'}
      </span>

      {/* Opponent crest */}
      {nextMatch.opponentCrest ? (
        <Image
          src={nextMatch.opponentCrest}
          alt={nextMatch.opponentName}
          width={16}
          height={16}
          className="h-4 w-4 object-contain flex-shrink-0"
        />
      ) : (
        <div className="h-4 w-4 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-muted-foreground">?</span>
        </div>
      )}

      {/* Date */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatShortDate(nextMatch.utcDate)}
      </span>
    </div>
  );
}
