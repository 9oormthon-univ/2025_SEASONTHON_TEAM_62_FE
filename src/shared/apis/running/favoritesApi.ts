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



export type FavoriteDetailDTO = {
  id: number;
  name: string;
  waypoints?: string[]; // ["36.3504,127.3845", ...]
  savedPolyline?: string; // "abcd..."
  distanceM?: number;
  durationS?: number;
  createdAt?: string;
};

export async function fetchFavoriteDetail(params: {
  id: number;
  userId: number;
}): Promise<FavoriteDetailDTO> {
  const { id, userId } = params;
  const res = await api.get('/api/favorites/' + id, { params: { userId } });

  // 응답 형태 방어
  const raw = res.data;
  // 1) { success: "true", data: {...} } 케이스
  if (raw?.data) return raw.data as FavoriteDetailDTO;
  // 2) 바로 객체가 오는 케이스
  return raw as FavoriteDetailDTO;
}
