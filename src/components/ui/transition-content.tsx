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
        'transition-opacity duration-200',
        isPending && 'pointer-events-none opacity-50',
        className
      )}
      aria-busy={isPending}
    >
      {children}
    </div>
  );
}
