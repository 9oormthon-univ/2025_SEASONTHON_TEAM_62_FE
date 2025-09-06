import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import FloatingBackButton from './components/floatingButton';
import api from '../../shared/apis/api';

type GraphNode = { id: string; lat: number; lng: number };

type FavoriteDetailResponse = {
  success: string;
  data: {
    id: number;
    name: string;
    waypoints: string[];
    savedPolyline: string;
    distanceM: number;
    durationS: number;
    createdAt: string;
  };
};

function waypointsToNodes(waypoints: string[]): GraphNode[] {
  return waypoints.map((waypoint, index) => {
    const [lat, lng] = waypoint.split(',').map(Number);
    return {
      id:
        index === 0
          ? 'start'
          : index === waypoints.length - 1
            ? 'end'
            : `n${index}`,
      lat,
      lng,
    };
  });
}

function metersToKm(meters: number): string {
  return (meters / 1000).toFixed(1);
}

function secondsToTimeText(seconds: number): { min: string; sec: string } {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return {
    min: minutes.toString(),
    sec: remainingSeconds.toString().padStart(2, '0'),
  };
}

const mockRoute = {
  nodes: [{ id: 'start', lat: 35.8887, lng: 128.6111 }],
};

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [favoriteData, setFavoriteData] = useState<
    FavoriteDetailResponse['data'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startLocation, setStartLocation] = useState('경북대학교 정문');
  const [distance, setDistance] = useState<string>('');
  const [minPace, setMinPace] = useState('');
  const [maxPace, setMaxPace] = useState('');

  const userId = 7;

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);

      api
        .get(`/api/favorites/${id}`, {
          params: { userId },
        })
        .then((response) => {
          const data: FavoriteDetailResponse = response.data;
          if (data.success === 'true') {
            setFavoriteData(data.data);

            setStartLocation(data.data.name);
            setDistance(metersToKm(data.data.distanceM));
            const pacePerKm =
              data.data.durationS / (data.data.distanceM / 1000);
            const timeText = secondsToTimeText(Math.round(pacePerKm));
            setMinPace(timeText.min);
            setMaxPace(timeText.sec);
          } else {
            throw new Error('즐겨찾기 데이터가 올바르지 않습니다.');
          }
        })
        .catch((err) => {
          console.group('❌ API Error Details');
          console.log('Error object:', err);
          console.log('Error response:', err.response);
          console.log('Error request:', err.request);
          console.groupEnd();

          let errorMessage = '즐겨찾기 정보를 가져오는데 실패했습니다.';

          if (err.response) {
            errorMessage =
              err.response?.data?.message ||
              `서버 오류 (${err.response.status})`;
          } else if (err.request) {
            errorMessage = '네트워크 오류 - 서버에 연결할 수 없습니다.';
          } else {
            errorMessage = err.message;
          }

          setError(errorMessage);
        })
        .finally(() => {
          console.log('🏁 API request completed');
          setLoading(false);
        });
    } else {
      console.log('⚠️ No ID provided in params');
    }
  }, [id]);

  const handleSearchRoute = () => {
    console.log('🔍 Starting route search with data:', {
      startLocation,
      distance,
      minPace,
      maxPace,
      favoriteId: id,
    });

    const params = new URLSearchParams({
      start: startLocation.trim(),
      distance: (distance || '0').trim(),
      paceMin: (minPace || '0').trim(),
      paceSec: (maxPace || '0').trim(),
    });

    if (id) {
      params.append('favoriteId', id);
      params.append('userId', userId.toString());
    }

    navigate(`/running/${id}/path?${params.toString()}`);
  };

  if (loading) {
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

          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="text-lg font-semibold">로딩중...</div>
              <div className="text-sm text-gray-500 mt-2">
                즐겨찾기 정보를 가져오고 있습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-500">
                오류가 발생했습니다
              </div>
              <div className="text-sm text-gray-500 mt-2">{error}</div>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-main2 text-white rounded"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nodes = favoriteData
    ? waypointsToNodes(favoriteData.waypoints)
    : mockRoute.nodes;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <FloatingBackButton />
        </div>

        <RouteFromLinks
          nodes={nodes}
          showStartPin={true}
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
          className="w-full rounded-lg bg-main2 py-3 text-sem16 text-white disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? '로딩중...' : '경로 찾기'}
        </button>
      </div>
    </div>
  );
}
