import { z } from 'zod';
import { MatchesResponseSchema, StandingsResponseSchema, TeamDetailSchema } from './schemas';
import type { MatchesResponse, StandingsResponse, TeamDetail } from '@/types/football-api';

const BASE_URL = 'https://api.football-data.org/v4';

export class FootballAPIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'FootballAPIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options?: { revalidate?: number }
): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    throw new FootballAPIError(500, 'FOOTBALL_DATA_API_KEY is not configured');
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'X-Auth-Token': apiKey,
    },
    next: { revalidate: options?.revalidate ?? 60 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new FootballAPIError(res.status, errorText);
  }

  const data = await res.json();
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    console.error('Validation error:', parsed.error);
    throw new FootballAPIError(500, 'Invalid response format from Football API');
  }

  return parsed.data;
}

export interface GetMatchesOptions {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export const footballAPI = {
  async getMatches(code: string, options?: GetMatchesOptions): Promise<MatchesResponse> {
    const params = new URLSearchParams();
    if (options?.dateFrom) params.set('dateFrom', options.dateFrom);
    if (options?.dateTo) params.set('dateTo', options.dateTo);
    if (options?.status) params.set('status', options.status);

    const query = params.toString();
    const endpoint = `/competitions/${code}/matches${query ? `?${query}` : ''}`;

    return fetchAPI(endpoint, MatchesResponseSchema, { revalidate: 120 });
  },

  async getStandings(code: string): Promise<StandingsResponse> {
    return fetchAPI(`/competitions/${code}/standings`, StandingsResponseSchema, {
      revalidate: 600,
    });
  },

  async getTeam(id: number): Promise<TeamDetail> {
    return fetchAPI(`/teams/${id}`, TeamDetailSchema, { revalidate: 3600 });
  },
};
