'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState, type ReactNode } from 'react';
import { NavigationTransitionProvider } from '@/components/providers/navigation-transition-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationTransitionProvider>{children}</NavigationTransitionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
