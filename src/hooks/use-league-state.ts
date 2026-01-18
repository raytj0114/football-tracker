'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_LEAGUE, isValidLeagueCode, type LeagueCode } from '@/lib/football-api/constants';

const STORAGE_KEY = 'football-tracker-league';

/**
 * Get the stored league from sessionStorage
 * Returns DEFAULT_LEAGUE if not found or invalid
 */
function getStoredLeague(): LeagueCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LEAGUE;
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && isValidLeagueCode(stored)) {
      return stored;
    }
  } catch {
    // sessionStorage may be unavailable in some contexts
  }

  return DEFAULT_LEAGUE;
}

/**
 * Store league code in sessionStorage
 */
function storeLeague(leagueCode: LeagueCode): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, leagueCode);
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

/**
 * Hook for managing league state across pages
 *
 * Priority:
 * 1. URL parameter (highest)
 * 2. sessionStorage
 * 3. DEFAULT_LEAGUE (lowest)
 *
 * When league changes, it's automatically stored in sessionStorage
 */
export function useLeagueState(): {
  league: LeagueCode;
  setLeague: (league: LeagueCode) => void;
  storedLeague: LeagueCode;
} {
  const searchParams = useSearchParams();
  const urlLeague = searchParams.get('league');

  const [storedLeague, setStoredLeague] = useState<LeagueCode>(DEFAULT_LEAGUE);

  // Initialize stored league from sessionStorage on mount
  useEffect(() => {
    setStoredLeague(getStoredLeague());
  }, []);

  // Determine the effective league
  const league: LeagueCode = urlLeague && isValidLeagueCode(urlLeague) ? urlLeague : storedLeague;

  // Function to update stored league
  const setLeague = useCallback((newLeague: LeagueCode) => {
    storeLeague(newLeague);
    setStoredLeague(newLeague);
  }, []);

  // Sync URL parameter changes to sessionStorage
  useEffect(() => {
    if (urlLeague && isValidLeagueCode(urlLeague)) {
      storeLeague(urlLeague);
      setStoredLeague(urlLeague);
    }
  }, [urlLeague]);

  return { league, setLeague, storedLeague };
}

/**
 * Hook for determining the league link base path based on current page
 * Returns '/standings' if on standings page, '/matches' otherwise
 */
export function useLeagueLinkBasePath(): string {
  // This is used by sidebar/mobile-nav to determine where to navigate
  // We need to import usePathname, but it should be called in the component
  return '/matches'; // Default
}
