# Next.js パターン詳細

## Server Actions

```typescript
// app/actions/favorites.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const Schema = z.object({ teamId: z.number() });

export async function addFavorite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { teamId } = Schema.parse({
    teamId: Number(formData.get('teamId')),
  });

  await prisma.favoriteTeam.create({
    data: { userId: session.user.id, teamId },
  });

  revalidatePath('/favorites');
}
```

## Route Handler

```typescript
// app/api/matches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  competition: z.string().default('PL'),
});

export async function GET(req: NextRequest) {
  const query = QuerySchema.safeParse({
    competition: req.nextUrl.searchParams.get('competition'),
  });

  if (!query.success) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${query.data.competition}/matches`,
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

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## キャッシュ再検証

```typescript
// タグベース
fetch(url, { next: { tags: ['matches'] } });

// 手動再検証
import { revalidateTag, revalidatePath } from 'next/cache';
revalidateTag('matches');
revalidatePath('/matches');
```
