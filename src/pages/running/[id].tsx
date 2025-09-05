import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import FloatingBackButton from './components/floatingButton';

const mockRoute = {
  nodes: [{ id: 'start', lat: 35.8887, lng: 128.6111 }],
};

export default function DetailPage() {
  const [startLocation, setStartLocation] = useState('경북대학교 정문');
  const [distance, setDistance] = useState<string>('');
  const [minPace, setMinPace] = useState('');
  const [maxPace, setMaxPace] = useState('');

  const navigate = useNavigate();

  const handleSearchRoute = () => {
    const id = Date.now().toString(); // 임시 id (원하면 서버 생성 id 사용)
    const params = new URLSearchParams({
      start: startLocation.trim(),
      distance: (distance || '0').trim(),
      paceMin: (minPace || '0').trim(),
      paceSec: (maxPace || '0').trim(),
    });

    navigate(`/running/${id}/path?${params.toString()}`);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <FloatingBackButton />
        </div>

        <RouteFromLinks
          nodes={mockRoute.nodes}
          showEndPin={false}
        />
      </div>

      <div className="bg-white p-6 rounded-t-md">
        <div className="mb-4 flex items-center gap-4">
          <label className="w-28 shrink-0 text-sem18 text-black">
            출발지점
          </label>
          <input
            type="text"
            className="mt-0 py-2 border w-full rounded-md px-3 border-gray3 text-med14 focus:border-main1 focus:ring-main1"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <label className="w-28 shrink-0 text-sem18 text-black">거리</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="mt-0 py-2 placeholder:text-gray1 border w-[112px] rounded-md px-3 border-gray3 text-med14 focus:border-main1 focus:ring-main1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0"
            />
            <span className="text-black text-med14">Km</span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="w-28 shrink-0 text-sem18 text-black">
            목표 페이스
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="mt-0 placeholder:text-gray1 py-2 border w-[45px] rounded-md px-3 border-gray3 text-med14 focus:border-main1 focus:ring-main1"
              value={minPace}
              onChange={(e) => setMinPace(e.target.value)}
              maxLength={2}
              placeholder="00"
            />
            <span className="text-black text-med14">'</span>
            <input
              type="text"
              className="mt-0 py-2 placeholder:text-gray1 border w-[45px] rounded-md px-3 border-gray3 text-med14 focus:border-main1 focus:ring-main1"
              value={maxPace}
              onChange={(e) => setMaxPace(e.target.value)}
              maxLength={2}
              placeholder="00"
            />
            <span className="text-black text-med14">"</span>
          </div>
        </div>

        <button
          onClick={handleSearchRoute}
          className="w-full rounded-lg bg-main2 py-3 text-sem16 text-white"
        >
          경로 찾기
        </button>
      </div>
    </div>
  );
}
