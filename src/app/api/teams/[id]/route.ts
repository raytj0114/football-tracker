import { NextRequest, NextResponse } from 'next/server';
import { footballAPI, FootballAPIError } from '@/lib/football-api/client';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    const data = await footballAPI.getTeam(teamId);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof FootballAPIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
