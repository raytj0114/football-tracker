'use client';

import { useState, useTransition, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { generateTeamComment, type GenerateCommentInput } from '@/app/actions/team-comment';
import { cn } from '@/lib/utils';

interface TeamCommentPopoverProps {
  teamData: GenerateCommentInput;
}

export function TeamCommentPopover({ teamData }: TeamCommentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // リーグが変わったら状態をリセット
  useEffect(() => {
    setComment(null);
    setError(null);
  }, [teamData.leagueCode]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen && !comment && !error) {
      startTransition(async () => {
        const result = await generateTeamComment(teamData);
        if (result.success) {
          setComment(result.comment);
        } else {
          setError(result.error);
        }
      });
    }
  };

  const handleRegenerate = () => {
    setComment(null);
    setError(null);
    startTransition(async () => {
      const result = await generateTeamComment(teamData, true); // skipCache: true
      if (result.success) {
        setComment(result.comment);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center gap-0.5 rounded-md px-1.5 py-0.5',
            'text-muted-foreground hover:text-primary hover:bg-muted/50',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
          aria-label="AIコメントを表示"
        >
          <Sparkles className="h-3 w-3" />
          <span className="text-[10px] font-medium">AI</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80" align="start">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AIコメント</span>
        </div>
        <div className="mt-3" aria-busy={isPending}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-muted-foreground">生成中...</span>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isPending}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5',
                  'text-xs font-medium text-muted-foreground',
                  'bg-muted/50 hover:bg-muted hover:text-foreground',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
              >
                <RefreshCw className="h-3 w-3" />
                再試行
              </button>
            </div>
          ) : comment ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{comment}</p>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isPending}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5',
                  'text-xs font-medium text-muted-foreground',
                  'bg-muted/50 hover:bg-muted hover:text-foreground',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
              >
                <RefreshCw className="h-3 w-3" />
                再生成
              </button>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
