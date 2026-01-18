'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isValidLeagueCode } from '@/lib/football-api/constants';

const STORAGE_KEY = 'football-tracker-league';

interface LeagueRedirectProps {
  basePath: string;
}

/**
 * Client component that redirects to stored league if URL has no league parameter
 * This ensures consistent navigation when moving between pages
 */
export function LeagueRedirect({ basePath }: LeagueRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlLeague = searchParams.get('league');

  useEffect(() => {
    // If URL already has a league parameter, no need to redirect
    if (urlLeague) {
      return;
    }

    // Check sessionStorage for stored league
    try {
      const storedLeague = sessionStorage.getItem(STORAGE_KEY);
      if (storedLeague && isValidLeagueCode(storedLeague)) {
        // Redirect to the same page with the stored league parameter
        const params = new URLSearchParams(searchParams.toString());
        params.set('league', storedLeague);
        router.replace(`${basePath}?${params.toString()}`);
      }
    } catch {
      // sessionStorage may be unavailable in some contexts
    }
  }, [urlLeague, basePath, router, searchParams]);

  return null;
}
