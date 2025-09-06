import api from '../api';

export type FavoriteRoute = {
  id: number;
  name: string;
  distanceKm: number;
  type: 'safe' | 'normal' | 'fast';
};

export type FavoritesResponse =
  | { code: string; success: string; msg: string; data?: FavoriteRoute[] }
  | FavoriteRoute[];

export async function fetchFavorites(userId: number): Promise<FavoriteRoute[]> {
  const res = await api.get<FavoritesResponse>('/api/favorites', {
    params: { userId },
  });

  const data = res.data as any;
  if (Array.isArray(data)) return data;

  if (data?.data && Array.isArray(data.data)) return data.data;

  return [];
}
