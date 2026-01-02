import { NextRequest, NextResponse } from 'next/server';
import { footballAPI, FootballAPIError } from '@/lib/football-api/client';
import { DEFAULT_LEAGUE } from '@/lib/football-api/constants';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get('league') ?? DEFAULT_LEAGUE;
  const dateFrom = searchParams.get('dateFrom') ?? undefined;
  const dateTo = searchParams.get('dateTo') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  try {
    const data = await footballAPI.getMatches(league, { dateFrom, dateTo, status });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof FootballAPIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
