'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimistic } from 'react';
import { AVAILABLE_LEAGUES, DEFAULT_LEAGUE } from '@/lib/football-api/constants';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigationTransition } from '@/hooks/use-navigation-transition';
import { cn } from '@/lib/utils';

interface LeagueSelectorProps {
  basePath: string;
}

export function LeagueSelector({ basePath }: LeagueSelectorProps) {
  const searchParams = useSearchParams();
  const { isPending, startTransition } = useNavigationTransition();
  const router = useRouter();
  const currentLeague = searchParams.get('league') ?? DEFAULT_LEAGUE;

  const [optimisticLeague, setOptimisticLeague] = useOptimistic(currentLeague);

  const handleLeagueChange = (code: string) => {
    if (code === currentLeague) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('league', code);

    startTransition(() => {
      setOptimisticLeague(code);
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  return (
    <Tabs value={optimisticLeague} onValueChange={handleLeagueChange} className="w-full">
      <TabsList
        className={cn(
          'h-auto w-full grid grid-cols-3 sm:grid-cols-6 gap-1 bg-muted/50 p-1 rounded-lg',
          'transition-opacity duration-150',
          isPending && 'opacity-70'
        )}
      >
        {AVAILABLE_LEAGUES.map((league) => (
          <TabsTrigger
            key={league.code}
            value={league.code}
            disabled={isPending}
            className={cn(
              'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
              'data-[state=active]:shadow-sm',
              'transition-all duration-150',
              'flex-col sm:flex-row gap-1 sm:gap-1.5 py-2 sm:py-1.5',
              isPending && 'cursor-wait'
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded bg-white p-0.5">
              <Image
                src={league.emblem}
                alt={league.name}
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
            </div>
            <span className="hidden sm:inline text-xs">{league.name}</span>
            <span className="sm:hidden text-[10px]">{league.code}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
