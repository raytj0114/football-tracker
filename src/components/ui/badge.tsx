import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'live';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-primary text-primary-foreground shadow': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground shadow': variant === 'destructive',
          'border border-border text-foreground': variant === 'outline',
          'bg-win text-white shadow': variant === 'success',
          'bg-draw text-foreground shadow': variant === 'warning',
          'bg-live text-white shadow animate-pulse-live': variant === 'live',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
