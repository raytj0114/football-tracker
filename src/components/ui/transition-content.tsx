'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useNavigationTransitionContext } from '@/components/providers/navigation-transition-provider';

interface TransitionContentProps {
  children: ReactNode;
  className?: string;
}

export function TransitionContent({ children, className }: TransitionContentProps) {
  const { isPending } = useNavigationTransitionContext();

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isPending && 'pointer-events-none scale-[0.99] opacity-60',
        className
      )}
      aria-busy={isPending}
    >
      {children}
    </div>
  );
}
