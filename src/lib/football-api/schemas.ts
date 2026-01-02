import { z } from 'zod';

export const CompetitionSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  type: z.enum(['LEAGUE', 'CUP']),
  emblem: z.string().nullable(),
});

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortName: z.string(),
  tla: z.string(),
  crest: z.string().nullable(),
});

// Team schema for matches where team might be TBD (e.g., CL knockout rounds)
export const MatchTeamSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  tla: z.string().nullable(),
  crest: z.string().nullable(),
});

export const CoachSchema = z.object({
  id: z.number(),
  name: z.string(),
  nationality: z.string().nullable(),
});

export const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  nationality: z.string().nullable(),
});

export const TeamDetailSchema = TeamSchema.extend({
  address: z.string().nullable(),
  website: z.string().nullable(),
  founded: z.number().nullable(),
  clubColors: z.string().nullable(),
  venue: z.string().nullable(),
  coach: CoachSchema.nullable(),
  squad: z.array(PlayerSchema),
  runningCompetitions: z.array(CompetitionSchema),
});

export const ScoreSchema = z.object({
  winner: z.enum(['HOME_TEAM', 'AWAY_TEAM', 'DRAW']).nullable(),
  fullTime: z.object({
    home: z.number().nullable(),
    away: z.number().nullable(),
  }),
  halfTime: z.object({
    home: z.number().nullable(),
    away: z.number().nullable(),
  }),
});

export const MatchSchema = z.object({
  id: z.number(),
  utcDate: z.string(),
  status: z.enum([
    'SCHEDULED',
    'TIMED',
    'IN_PLAY',
    'PAUSED',
    'FINISHED',
    'SUSPENDED',
    'POSTPONED',
    'CANCELLED',
    'AWARDED',
  ]),
  matchday: z.number().nullable(),
  stage: z.string().nullable(),
  homeTeam: MatchTeamSchema,
  awayTeam: MatchTeamSchema,
  score: ScoreSchema,
  competition: CompetitionSchema,
});

export const MatchesResponseSchema = z.object({
  competition: CompetitionSchema,
  matches: z.array(MatchSchema),
});

export const StandingEntrySchema = z.object({
  position: z.number(),
  team: TeamSchema,
  playedGames: z.number(),
  won: z.number(),
  draw: z.number(),
  lost: z.number(),
  points: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  goalDifference: z.number(),
});

export const StandingsResponseSchema = z.object({
  competition: CompetitionSchema,
  season: z.object({
    id: z.number(),
    startDate: z.string(),
    endDate: z.string(),
    currentMatchday: z.number().nullable(),
  }),
  standings: z.array(
    z.object({
      stage: z.string(),
      type: z.string(),
      table: z.array(StandingEntrySchema),
    })
  ),
});
