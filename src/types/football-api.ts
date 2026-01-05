export interface Competition {
  id: number;
  name: string;
  code: string;
  type: 'LEAGUE' | 'CUP' | 'SUPER_CUP' | 'PLAYOFFS';
  emblem: string | null;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

// Team in match context - can have null values for TBD matches (e.g., CL knockout rounds)
export interface MatchTeam {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface TeamDetail extends Team {
  address: string | null;
  website: string | null;
  founded: number | null;
  clubColors: string | null;
  venue: string | null;
  coach: Coach | null;
  squad: Player[];
  runningCompetitions: Competition[];
}

export interface Coach {
  id: number;
  name: string;
  nationality: string | null;
}

export interface Player {
  id: number;
  name: string;
  position: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string | null;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: Score;
  competition: Competition;
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'AWARDED';

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingsResponse {
  competition: Competition;
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number | null;
  };
  standings: {
    stage: string;
    type: string;
    table: Standing[];
  }[];
}

export interface MatchesResponse {
  competition: Competition;
  matches: Match[];
}
