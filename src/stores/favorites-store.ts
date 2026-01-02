import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteTeam {
  teamId: number;
  teamName: string;
  teamCrest: string | null;
}

interface FavoritesState {
  favorites: FavoriteTeam[];
  showOnlyFavorites: boolean;
  setFavorites: (favorites: FavoriteTeam[]) => void;
  addFavorite: (team: FavoriteTeam) => void;
  removeFavorite: (teamId: number) => void;
  toggleShowOnlyFavorites: () => void;
  isFavorite: (teamId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      showOnlyFavorites: false,
      setFavorites: (favorites) => set({ favorites }),
      addFavorite: (team) =>
        set((state) => ({
          favorites: [...state.favorites, team],
        })),
      removeFavorite: (teamId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.teamId !== teamId),
        })),
      toggleShowOnlyFavorites: () =>
        set((state) => ({ showOnlyFavorites: !state.showOnlyFavorites })),
      isFavorite: (teamId) => get().favorites.some((f) => f.teamId === teamId),
    }),
    { name: 'favorites-storage' }
  )
);
