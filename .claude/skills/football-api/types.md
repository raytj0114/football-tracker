# Football-Data.org 型定義

## TypeScript型

```typescript
// types/football-api.ts

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: 'LEAGUE' | 'CUP';
  emblem: string | null;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

export type MatchStatus = 
  | 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED'
  | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED' | 'AWARDED';

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
```

## Zodスキーマ

```typescript
// lib/football-api/schemas.ts
import { z } from 'zod';

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortName: z.string(),
  tla: z.string(),
  crest: z.string().nullable(),
});

export const MatchSchema = z.object({
  id: z.number(),
  utcDate: z.string(),
  status: z.enum([
    'SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED',
    'FINISHED', 'SUSPENDED', 'POSTPONED', 'CANCELLED', 'AWARDED'
  ]),
  matchday: z.number(),
  homeTeam: TeamSchema,
  awayTeam: TeamSchema,
  score: z.object({
    winner: z.enum(['HOME_TEAM', 'AWAY_TEAM', 'DRAW']).nullable(),
    fullTime: z.object({
      home: z.number().nullable(),
      away: z.number().nullable(),
    }),
  }),
});

export const MatchesResponseSchema = z.object({
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
```
