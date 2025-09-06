import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RunningBottomSheet } from './components/runningBottomSheet';
import SearchCenterMap from '../../shared/components/kakaomap/searchCenterMap';
import RouteListItem from './components/listItem';
import {
  fetchFavorites,
  type FavoriteRoute,
} from '../../shared/apis/running/favoritesApi';

export type RouteItem = FavoriteRoute;

const recentRoutes: RouteItem[] = [
  { id: 10, name: '신천동로 코스', distanceKm: 3, type: 'normal' },
  { id: 11, name: '금호강 수변', distanceKm: 7, type: 'fast' },
];

export default function RunningPage() {
  const [isBottomSheetOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>(
    'favorites',
  );
  const [favorites, setFavorites] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = 1;

  const navigate = useNavigate();

  const handleItemClick = (item: RouteItem) => {
    navigate(`/running/${item.id}`);
  };

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFavorites(userId);
        if (!ignore) setFavorites(data);
      } catch (e: any) {
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
        <SearchCenterMap fillParent />
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
                </>
              )}

              {!loading && !error && listToRender.length > 0 && (
                <ul className="divide-y divide-gray3">
                  {listToRender.map((item) => (
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
