# Football-Data.org 実装例

## APIクライアント

```typescript
// lib/football-api/client.ts
const BASE_URL = 'https://api.football-data.org/v4';

class FootballAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'FootballAPIError';
  }
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new FootballAPIError(res.status, await res.text());
  }
  return res.json();
}

export const getMatches = (code: string) => 
  fetchAPI(`/competitions/${code}/matches`);

export const getStandings = (code: string) => 
  fetchAPI(`/competitions/${code}/standings`);

export const getTeam = (id: number) => 
  fetchAPI(`/teams/${id}`);
```

## レート制限

```typescript
// lib/football-api/rate-limiter.ts
const requests: number[] = [];
const LIMIT = 10;
const WINDOW = 60_000;

export async function checkRateLimit(): Promise<void> {
  const now = Date.now();
  while (requests.length && requests[0] < now - WINDOW) {
    requests.shift();
  }
  if (requests.length >= LIMIT) {
    const wait = requests[0] + WINDOW - now;
    throw new Error(`Rate limit. Wait ${Math.ceil(wait / 1000)}s`);
  }
  requests.push(now);
}
```

## React Query フック

```typescript
// hooks/use-football.ts
'use client';
import { useQuery } from '@tanstack/react-query';

export function useMatches(code: string) {
  return useQuery({
    queryKey: ['matches', code],
    queryFn: () => fetch(`/api/matches?competition=${code}`).then(r => r.json()),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useStandings(code: string) {
  return useQuery({
    queryKey: ['standings', code],
    queryFn: () => fetch(`/api/standings?competition=${code}`).then(r => r.json()),
    staleTime: 5 * 60_000,
  });
}
```

## Route Handler

```typescript
// app/api/matches/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('competition') ?? 'PL';
  
  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${code}/matches`,
    {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed' }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
```

## エラーハンドリング

| Status | 原因 | 対処 |
|--------|------|------|
| 400 | 不正パラメータ | リクエスト確認 |
| 403 | 認証エラー | APIキー確認 |
| 404 | リソースなし | ID/コード確認 |
| 429 | レート制限 | 60秒待機 |
