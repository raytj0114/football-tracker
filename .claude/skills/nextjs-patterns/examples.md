# Next.js App Router 実装例

## Server Component データフェッチ

```typescript
// app/matches/page.tsx
async function getMatches() {
  const res = await fetch('https://api.example.com/matches', {
    headers: { 'X-Auth-Token': process.env.API_KEY! },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function MatchesPage() {
  const data = await getMatches();
  return <MatchList matches={data.matches} />;
}
```

## loading.tsx

```typescript
// app/matches/loading.tsx
export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}
```

## error.tsx

```typescript
// app/matches/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-bold text-red-600">エラーが発生しました</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        再試行
      </button>
    </div>
  );
}
```

## メタデータ

```typescript
// app/matches/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Matches | Football App',
  description: 'View football matches',
};

// 動的メタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const team = await getTeam(params.id);
  return { title: `${team.name} | Football App` };
}
```
