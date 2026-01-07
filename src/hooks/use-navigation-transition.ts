'use client';

import { useRouter } from 'next/navigation';
import { useNavigationTransitionContext } from '@/components/providers/navigation-transition-provider';

export function useNavigationTransition() {
  const router = useRouter();
  const { isPending, startTransition } = useNavigationTransitionContext();

  const navigateWithTransition = (url: string) => {
    startTransition(() => {
      router.push(url);
    });
  };

  return { isPending, navigateWithTransition };
}
