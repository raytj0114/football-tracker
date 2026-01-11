'use client';

import { cn } from '@/lib/utils';

interface PageProgressProps {
  isLoading: boolean;
}

export function PageProgress({ isLoading }: PageProgressProps) {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-primary/20 md:h-[2px]"
      role="progressbar"
      aria-label="ページ読み込み中"
    >
      <div
        className={cn(
          'h-full w-1/4 bg-gradient-to-r from-primary via-primary to-primary/50',
          'animate-progress-indeterminate'
        )}
      />
    </div>
  );
}
