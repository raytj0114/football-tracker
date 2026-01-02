'use client';

import { useQuery } from '@tanstack/react-query';
import type { MatchesResponse, StandingsResponse, TeamDetail } from '@/types/football-api';

interface FetchMatchesOptions {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

async function fetchMatches(
  league: string,
  options?: FetchMatchesOptions
): Promise<MatchesResponse> {
  const params = new URLSearchParams({ league });
  if (options?.dateFrom) params.set('dateFrom', options.dateFrom);
  if (options?.dateTo) params.set('dateTo', options.dateTo);
  if (options?.status) params.set('status', options.status);

  const res = await fetch(`/api/matches?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch matches');
  }
  return res.json();
}

async function fetchStandings(league: string): Promise<StandingsResponse> {
  const res = await fetch(`/api/standings?league=${league}`);
  if (!res.ok) {
    throw new Error('Failed to fetch standings');
  }
  return res.json();
}

async function fetchTeam(id: number): Promise<TeamDetail> {
  const res = await fetch(`/api/teams/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch team');
  }
  return res.json();
}

export function useMatches(league: string, options?: FetchMatchesOptions) {
  return useQuery({
    queryKey: ['matches', league, options],
    queryFn: () => fetchMatches(league, options),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useStandings(league: string) {
  return useQuery({
    queryKey: ['standings', league],
    queryFn: () => fetchStandings(league),
    staleTime: 5 * 60_000,
  });
}

export function useTeam(id: number) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeam(id),
    staleTime: 30 * 60_000,
    enabled: id > 0,
  });
}
