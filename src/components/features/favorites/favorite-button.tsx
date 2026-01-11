'use client';

import { useState, useOptimistic, useTransition, useEffect, useRef } from 'react';
import { Heart, Loader2 } from 'lucide-react';
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
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevFavoriteRef = useRef(initialIsFavorite);

  // Trigger animation when favorite state changes to true
  useEffect(() => {
    if (optimisticIsFavorite && !prevFavoriteRef.current) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 350);
      return () => clearTimeout(timer);
    }
    prevFavoriteRef.current = optimisticIsFavorite;
  }, [optimisticIsFavorite]);

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
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
        'transition-all duration-200 ease-out',
        'active:scale-[0.96]',
        optimisticIsFavorite
          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
        isPending && 'opacity-70 cursor-not-allowed'
      )}
      aria-label={optimisticIsFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={cn(
            'h-5 w-5 transition-transform',
            optimisticIsFavorite && 'fill-current',
            shouldAnimate && 'animate-heart-pop'
          )}
        />
      )}
      {optimisticIsFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
    </button>
  );
}
