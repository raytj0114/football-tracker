'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const AddFavoriteSchema = z.object({
  teamId: z.number(),
  teamName: z.string(),
  teamCrest: z.string().nullable(),
});

export async function addFavorite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validated = AddFavoriteSchema.parse({
    teamId: Number(formData.get('teamId')),
    teamName: formData.get('teamName'),
    teamCrest: formData.get('teamCrest') || null,
  });

  await prisma.favoriteTeam.create({
    data: {
      userId: session.user.id,
      ...validated,
    },
  });

  revalidatePath('/favorites');
  revalidatePath('/teams/[id]', 'page');
}

export async function removeFavorite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const teamId = Number(formData.get('teamId'));

  await prisma.favoriteTeam.delete({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId,
      },
    },
  });

  revalidatePath('/favorites');
  revalidatePath('/teams/[id]', 'page');
}

export async function getFavorites() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.favoriteTeam.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function isFavorite(teamId: number): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const favorite = await prisma.favoriteTeam.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId,
      },
    },
  });

  return !!favorite;
}
