'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function UserButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button size="sm">ログイン</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/favorites" className="text-sm text-gray-600 hover:text-gray-900">
        お気に入り
      </Link>
      <div className="flex items-center gap-2">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
