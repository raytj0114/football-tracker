'use client';

import { useOptimistic, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { addFavorite, removeFavorite } from '@/app/actions/favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  teamId: number;
  teamName: string;
  teamCrest: string | null;
  initialIsFavorite: boolean;
}

export function FavoriteButton({
  teamId,
  teamName,
  teamCrest,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFavorite, setOptimisticIsFavorite] = useOptimistic(initialIsFavorite);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticIsFavorite(!optimisticIsFavorite);

      const formData = new FormData();
      formData.set('teamId', String(teamId));
      formData.set('teamName', teamName);
      formData.set('teamCrest', teamCrest ?? '');

      if (optimisticIsFavorite) {
        await removeFavorite(formData);
      } else {
        await addFavorite(formData);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        optimisticIsFavorite
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
      aria-label={optimisticIsFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart className={cn('h-5 w-5', optimisticIsFavorite && 'fill-current')} />
      {optimisticIsFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
    </button>
  );
}
