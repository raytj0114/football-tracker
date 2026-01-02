'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AVAILABLE_LEAGUES, DEFAULT_LEAGUE } from '@/lib/football-api/constants';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeagueSelectorProps {
  basePath: string;
}

export function LeagueSelector({ basePath }: LeagueSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLeague = searchParams.get('league') ?? DEFAULT_LEAGUE;

  const handleLeagueChange = (code: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('league', code);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <Tabs value={currentLeague} onValueChange={handleLeagueChange} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0">
        {AVAILABLE_LEAGUES.map((league) => (
          <TabsTrigger
            key={league.code}
            value={league.code}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="mr-1.5 flex h-5 w-5 items-center justify-center rounded bg-white p-0.5">
              <Image
                src={league.emblem}
                alt={league.name}
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
            </div>
            <span className="hidden sm:inline">{league.name}</span>
            <span className="sm:hidden">{league.code}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
