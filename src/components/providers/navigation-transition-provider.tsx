'use client';

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from 'react';
import { PageProgress } from '@/components/ui/page-progress';

interface NavigationTransitionContextValue {
  isPending: boolean;
  startTransition: TransitionStartFunction;
}

const NavigationTransitionContext = createContext<NavigationTransitionContextValue | null>(null);

export function useNavigationTransitionContext() {
  const context = useContext(NavigationTransitionContext);
  if (!context) {
    throw new Error(
      'useNavigationTransitionContext must be used within NavigationTransitionProvider'
    );
  }
  return context;
}

export function NavigationTransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  return (
    <NavigationTransitionContext.Provider value={{ isPending, startTransition }}>
      <PageProgress isLoading={isPending} />
      {children}
    </NavigationTransitionContext.Provider>
  );
}
