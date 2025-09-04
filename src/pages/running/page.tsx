import { useState } from 'react';
import { RunningBottomSheet } from './components/BottomSheet';
import KakaoMapBasic from '../../shared/components/kakaomap/kakaomapBase';
import { useNavigate } from 'react-router-dom';

const favoritePlaces = [
  {
    id: 1,
    name: '경북대학교 정문',
  },
];

export default function RunningPage() {
  const [isBottomSheetOpen, _] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');
  const navigate = useNavigate();

  const handleItemClick = () => {
    navigate(`/running/1`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <KakaoMapBasic />
      </div>

      <div className="relative z-5">
        <RunningBottomSheet open={isBottomSheetOpen}>
          <div className="p-4">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`rounded-[20px] py-2 px-12 font-bold transition-colors duration-200 
                ${activeTab === 'favorites' ? 'border-2 border-main2 text-main2' : 'border-2 border-gray3 text-gray1'}`}
              >
                즐겨찾기
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`rounded-[20px] py-2 px-12 font-bold transition-colors duration-200 
                ${activeTab === 'recent' ? 'border-2 border-main2 text-main2' : 'border-2 border-gray3 text-gray1'}`}
              >
                최근 경로
              </button>
            </div>
            <div className="mt-4">
              {activeTab === 'favorites' && (
                <ul className="space-y-4">
                  {favoritePlaces.map((place) => (
                    <li
                      key={place.id}
                      className="p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                      onClick={handleItemClick}
                    >
                      <h3 className="text-lg font-semibold">{place.name}</h3>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'recent' && <div>최근 경로리스트</div>}
            </div>
          </div>
        </RunningBottomSheet>
      </div>
    </div>
  );
}
