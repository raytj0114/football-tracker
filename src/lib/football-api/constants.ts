import type { BadgeProps } from '@/components/ui/badge';

export const AVAILABLE_LEAGUES = [
  {
    code: 'PL',
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    emblem: 'https://crests.football-data.org/PL.png',
  },
  {
    code: 'BL1',
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    emblem: 'https://crests.football-data.org/BL1.png',
  },
  {
    code: 'SA',
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    emblem: 'https://crests.football-data.org/SA.png',
  },
  {
    code: 'PD',
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    emblem: 'https://crests.football-data.org/PD.png',
  },
  {
    code: 'FL1',
    name: 'Ligue 1',
    country: 'France',
    flag: '🇫🇷',
    emblem: 'https://crests.football-data.org/FL1.png',
  },
  {
    code: 'CL',
    name: 'Champions League',
    country: 'Europe',
    flag: '🇪🇺',
    emblem: 'https://crests.football-data.org/CL.png',
  },
] as const;

export type LeagueCode = (typeof AVAILABLE_LEAGUES)[number]['code'];

export const DEFAULT_LEAGUE: LeagueCode = 'PL';

/**
 * Validates if a string is a valid LeagueCode
 */
export function isValidLeagueCode(code: string): code is LeagueCode {
  return AVAILABLE_LEAGUES.some((league) => league.code === code);
}

/**
 * Validates league code and returns a valid LeagueCode (defaults to DEFAULT_LEAGUE if invalid)
 */
export function validateLeagueCode(code: string | undefined): LeagueCode {
  if (code && isValidLeagueCode(code)) {
    return code;
  }
  return DEFAULT_LEAGUE;
}

export const MATCH_STATUSES = [
  'SCHEDULED',
  'TIMED',
  'IN_PLAY',
  'PAUSED',
  'FINISHED',
  'SUSPENDED',
  'POSTPONED',
  'CANCELLED',
  'AWARDED',
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: '予定',
  TIMED: '予定',
  IN_PLAY: '試合中',
  PAUSED: 'HT',
  FINISHED: '終了',
  SUSPENDED: '中断',
  POSTPONED: '延期',
  CANCELLED: '中止',
  AWARDED: '裁定',
};

export const MATCH_STATUS_VARIANTS: Record<MatchStatus, BadgeProps['variant']> = {
  SCHEDULED: 'secondary',
  TIMED: 'secondary',
  IN_PLAY: 'live',
  PAUSED: 'warning',
  FINISHED: 'outline',
  SUSPENDED: 'destructive',
  POSTPONED: 'warning',
  CANCELLED: 'destructive',
  AWARDED: 'default',
};

/**
 * Get the label for a match status with fallback
 */
export function getMatchStatusLabel(status: string): string {
  return MATCH_STATUS_LABELS[status as MatchStatus] ?? status;
}

/**
 * Get the variant for a match status with fallback
 */
export function getMatchStatusVariant(status: string): BadgeProps['variant'] {
  return MATCH_STATUS_VARIANTS[status as MatchStatus] ?? 'default';
}

// Position zones for standings table (2025-26 season rules)
export const POSITION_ZONES: Record<
  LeagueCode,
  {
    champions: number[];
    europa: number[];
    conferenceLeague: number[];
    relegationPlayoff: number[];
    relegation: number[];
  }
> = {
  PL: {
    champions: [1, 2, 3, 4],
    europa: [5],
    conferenceLeague: [6],
    relegationPlayoff: [],
    relegation: [18, 19, 20],
  },
  BL1: {
    champions: [1, 2, 3, 4],
    europa: [5],
    conferenceLeague: [6],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  SA: {
    champions: [1, 2, 3, 4],
    europa: [5],
    conferenceLeague: [6],
    relegationPlayoff: [],
    relegation: [18, 19, 20],
  },
  PD: {
    champions: [1, 2, 3, 4],
    europa: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [],
    relegation: [18, 19, 20],
  },
  FL1: {
    champions: [1, 2, 3],
    europa: [4],
    conferenceLeague: [5],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  CL: {
    // CLの特殊ルール: 1-8位はR16直行、9-24位はプレーオフ進出、25-36位は敗退
    champions: [1, 2, 3, 4, 5, 6, 7, 8],
    europa: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    conferenceLeague: [],
    relegationPlayoff: [],
    relegation: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  },
};
