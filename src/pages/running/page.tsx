import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RunningBottomSheet } from './components/runningBottomSheet';
import SearchCenterMap from '../../shared/components/kakaomap/searchCenterMap';
import RouteListItem from './components/listItem';

export type RouteItem = {
  id: number;
  name: string;
  distanceKm: number;
  type: 'safe' | 'normal' | 'fast';
};

const favoritePlaces: RouteItem[] = [
  { id: 1, name: '경북대학교 정문', distanceKm: 5, type: 'safe' },
  { id: 2, name: '경북대학교 정문', distanceKm: 5, type: 'safe' },
  { id: 3, name: '경북대학교 정문', distanceKm: 5, type: 'safe' },
  { id: 4, name: '경북대학교 정문', distanceKm: 5, type: 'safe' },
];

const recentRoutes: RouteItem[] = [
  { id: 10, name: '신천동로 코스', distanceKm: 3, type: 'normal' },
  { id: 11, name: '금호강 수변', distanceKm: 7, type: 'fast' },
];

export default function RunningPage() {
  const [isBottomSheetOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>(
    'favorites',
  );
  const navigate = useNavigate();

  const handleItemClick = (item: RouteItem) => {
    navigate(`/running/${item.id}`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SearchCenterMap fillParent />
      </div>

      <div className="relative z-5">
        <RunningBottomSheet open={isBottomSheetOpen}>
          <div className="px-5 pb-14">
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setActiveTab('favorites')}
                className={[
                  'rounded-[20px] py-2 px-12 font-semibold transition-colors duration-200',
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
                  'rounded-[20px] py-2 px-12 font-semibold transition-colors duration-200',
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
                <ul className="divide-y divide-gray3">
                  {favoritePlaces.map((item) => (
                    <RouteListItem
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item)}
                    />
                  ))}
                </ul>
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
