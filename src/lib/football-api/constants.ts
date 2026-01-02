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

export const MATCH_STATUS_LABELS: Record<string, string> = {
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

export const MATCH_STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
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

// Position zones for standings table
export const POSITION_ZONES: Record<
  LeagueCode,
  { champions: number[]; europa: number[]; relegation: number[] }
> = {
  PL: {
    champions: [1, 2, 3, 4],
    europa: [5, 6],
    relegation: [18, 19, 20],
  },
  BL1: {
    champions: [1, 2, 3, 4],
    europa: [5, 6],
    relegation: [16, 17, 18],
  },
  SA: {
    champions: [1, 2, 3, 4],
    europa: [5, 6],
    relegation: [18, 19, 20],
  },
  PD: {
    champions: [1, 2, 3, 4],
    europa: [5, 6],
    relegation: [18, 19, 20],
  },
  FL1: {
    champions: [1, 2, 3],
    europa: [4, 5],
    relegation: [16, 17, 18],
  },
  CL: {
    champions: [],
    europa: [],
    relegation: [],
  },
};
