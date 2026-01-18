'use client';

import { useState, useTransition, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { generateTeamComment, type GenerateCommentInput } from '@/app/actions/team-comment';
import { cn } from '@/lib/utils';

const AI_TOOLTIP_STORAGE_KEY = 'ai-comment-tooltip-shown';

interface TeamCommentPopoverProps {
  teamData: GenerateCommentInput;
}

export function TeamCommentPopover({ teamData }: TeamCommentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  // リーグが変わったら状態をリセット
  useEffect(() => {
    setComment(null);
    setError(null);
  }, [teamData.leagueCode]);

  // Check if tooltip has been shown before (only on first row)
  useEffect(() => {
    if (teamData.position !== 1) return; // Only show tooltip on first team

    try {
      const hasShown = localStorage.getItem(AI_TOOLTIP_STORAGE_KEY);
      if (!hasShown) {
        // Delay showing tooltip to avoid initial render issues
        const timer = setTimeout(() => {
          setShowTooltip(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, [teamData.position]);

  // Mark tooltip as shown when user interacts
  const dismissTooltip = () => {
    setShowTooltip(false);
    setTooltipDismissed(true);
    try {
      localStorage.setItem(AI_TOOLTIP_STORAGE_KEY, 'true');
    } catch {
      // localStorage may be unavailable
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    // Dismiss tooltip when popover is opened
    if (isOpen && showTooltip) {
      dismissTooltip();
    }

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

  const AIButton = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-0.5 rounded-md px-1.5 py-0.5',
        'text-muted-foreground hover:text-primary hover:bg-muted/50',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        showTooltip && 'ring-2 ring-primary animate-pulse'
      )}
      aria-label="AIコメントを表示"
    >
      <Sparkles className="h-3 w-3" />
      <span className="text-[10px] font-medium">AI</span>
    </button>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={showTooltip && !tooltipDismissed}>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{AIButton}</PopoverTrigger>
          </TooltipTrigger>
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
        <TooltipContent side="top" className="max-w-[200px] text-center">
          AIがチームの現状を分析してコメントします
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
