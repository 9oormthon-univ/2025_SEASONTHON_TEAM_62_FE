import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RunningBottomSheet } from './components/runningBottomSheet';
import SearchCenterMap from '../../shared/components/kakaomap/searchCenterMap';
import RouteListItem from './components/listItem';
import {
  fetchFavorites,
  type FavoriteRoute,
} from '../../shared/apis/running/favoritesApi';

export type RouteItem = FavoriteRoute & {
  id: number | string;
  name: string;
  distanceKm: number;
  type?: 'safe' | 'normal' | 'fast' | string;
};

const recentRoutes: RouteItem[] = [
  { id: 10, name: '신천동로 코스', distanceKm: 3, type: 'normal' } as RouteItem,
  { id: 11, name: '금호강 수변', distanceKm: 7, type: 'fast' } as RouteItem,
];

// 서버 응답(any) -> RouteItem으로 매핑
function mapToRouteItem(r: any): RouteItem {
  const id = r?.id ?? r?.routeId ?? r?.favoriteId ?? r?.idx ?? Date.now();
  const name =
    r?.name ?? r?.title ?? r?.startLocation ?? r?.routeName ?? '이름 없음';
  const distanceKmRaw =
    r?.distanceKm ?? r?.distanceKmValue ?? r?.distance ?? r?.lengthKm ?? 0;
  const distanceKm = Number(distanceKmRaw) || 0;

  // 서버의 type/safetyLevel 등 다양한 케이스 흡수
  const t = String(r?.type ?? r?.safetyLevel ?? r?.level ?? 'normal')
    .toLowerCase()
    .trim() as RouteItem['type'];

  return { ...(r as object), id, name, distanceKm, type: t };
}

// fetchFavorites 응답 파싱(여러 형태 방어)
function normalizeFavorites(raw: any): RouteItem[] {
  const list =
    (Array.isArray(raw) && raw) ||
    (Array.isArray(raw?.favorites) && raw.favorites) ||
    (Array.isArray(raw?.data?.favorites) && raw.data.favorites) ||
    (Array.isArray(raw?.data) && raw.data) ||
    [];

  return list.map(mapToRouteItem);
}

// MatePathPage가 기대하는 한글 라벨로 변환
function mapTypeToLabel(t?: string) {
  const v = String(t ?? '').toLowerCase();
  if (v === 'safe') return '안전';
  if (v === 'fast' || v === 'shortest') return '최단';
  return '보통';
}

export default function RunningPage() {
  const [isBottomSheetOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>(
    'favorites',
  );
  const [favorites, setFavorites] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const { userId, ready } = useUserStore((s) => ({
  //   userId: s.userId,
  //   ready: s.ready,
  // }));
  const userId = 7;
  const navigate = useNavigate();


  const handleFavoriteClick = (item: RouteItem) => {
    navigate('/mate/matepath', {
      state: { showMateSheet: true, favoriteId: item.id },
    });
  };
  const handleItemClick = (item: RouteItem) => {
    navigate(`/running/start?favoriteId=${item.id}`);
  };

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const raw = await fetchFavorites(userId);
        const mapped = normalizeFavorites(raw);

        if (!ignore) setFavorites(mapped);
      } catch (e: any) {
        console.error('fetchFavorites 실패:', e?.response?.data ?? e);
        if (!ignore) setError(e?.message ?? '즐겨찾기 조회에 실패했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const listToRender = useMemo(
    () => (activeTab === 'favorites' ? favorites : recentRoutes),
    [activeTab, favorites],
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SearchCenterMap
          fillParent
          onSelectStart={(p) => {
            const qs = new URLSearchParams({
              start: p.name,
              startLat: String(p.lat),
              startLng: String(p.lng),
            }).toString();
            navigate(`/running/detail?${qs}`);
          }}
        />
      </div>

      <div className="relative z-5">
        <RunningBottomSheet open={isBottomSheetOpen}>
          <div className="px-5 pb-14">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('favorites')}
                className={[
                  'rounded-[20px] px-12 py-2 font-semibold transition-colors duration-200',
                  activeTab === 'favorites'
                    ? 'border-2 border-main2 text-main2'
                    : 'border-2 border-gray3 text-gray1',
                ].join(' ')}
              >
                즐겨찾기
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={[
                  'rounded-[20px] px-12 py-2 font-semibold transition-colors duration-200',
                  activeTab === 'recent'
                    ? 'border-2 border-main2 text-main2'
                    : 'border-2 border-gray3 text-gray1',
                ].join(' ')}
              >
                최근 경로
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'favorites' && (
                <>
                  {loading && (
                    <div className="py-8 text-center text-gray1">
                      불러오는 중…
                    </div>
                  )}

                  {!loading && error && (
                    <div className="py-8 text-center text-red-500">{error}</div>
                  )}

                  {!loading && !error && listToRender.length === 0 && (
                    <div className="py-8 text-center text-gray1">
                      즐겨찾기가 비어 있어요.
                    </div>
                  )}

                  {!loading && !error && listToRender.length > 0 && (
                    <ul className="divide-y divide-gray3">
                      {listToRender.map((item) => (
                        <RouteListItem
                          key={item.id}
                          item={item}
                          onClick={() => handleFavoriteClick(item)} 
                        />
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === 'recent' && (
                <ul className="divide-y divide-gray3 ">
                  {recentRoutes.map((item) => (
                    <RouteListItem
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </RunningBottomSheet>
      </div>
    </div>
  );
}
