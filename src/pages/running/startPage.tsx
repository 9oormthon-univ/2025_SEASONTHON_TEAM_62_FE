import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import IcSvgPlay from '../../shared/icons/ic_play';
import api from '../../shared/apis/api';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = { id: string; from: string; to: string; color?: string };

type ControlState = 'idle' | 'running' | 'paused';

const COLOR_TODO = '#37DE61';
const COLOR_DONE = '#D9D9D9';
const USER_ID = 7;

// ---------------- 목데이터(즐겨찾기 없이 들어온 경우) ----------------
const MOCK_NODES: GraphNode[] = [
  { id: 'A', lat: 35.89065, lng: 128.6109 },
  { id: 'B', lat: 35.89005, lng: 128.6098 },
  { id: 'C', lat: 35.88895, lng: 128.60895 },
  { id: 'D', lat: 35.8877, lng: 128.6082 },
  { id: 'E', lat: 35.8872, lng: 128.6094 },
  { id: 'F', lat: 35.8881, lng: 128.6117 },
];

function buildMockLinks(): GraphLink[] {
  const pairs: Array<[string, string, string]> = [
    ['A', 'B', COLOR_TODO],
    ['B', 'C', COLOR_TODO],
    ['C', 'D', COLOR_TODO],
    ['D', 'E', COLOR_TODO],
    ['E', 'F', COLOR_TODO],
    ['F', 'A', COLOR_TODO],
  ];
  return pairs.map(([from, to, color], i) => ({
    id: `seg-${i}`,
    from,
    to,
    color,
  }));
}

// ---------------- 거리 계산 유틸리티 ----------------
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestPointOnPath(
  currentPos: LatLng,
  nodes: GraphNode[],
): {
  segmentIndex: number;
  distanceFromStart: number;
  nearestPoint: LatLng;
} {
  let minDistance = Infinity;
  let bestSegment = 0;
  let bestPoint = currentPos;
  let totalDistance = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const start = nodes[i];
    const end = nodes[i + 1];

    // 선분 위의 가장 가까운 점 찾기
    const A = currentPos.lat - start.lat;
    const B = currentPos.lng - start.lng;
    const C = end.lat - start.lat;
    const D = end.lng - start.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;
    if (param < 0) {
      xx = start.lat;
      yy = start.lng;
    } else if (param > 1) {
      xx = end.lat;
      yy = end.lng;
    } else {
      xx = start.lat + param * C;
      yy = start.lng + param * D;
    }

    const distance = calculateDistance(currentPos.lat, currentPos.lng, xx, yy);

    if (distance < minDistance) {
      minDistance = distance;
      bestSegment = i;
      bestPoint = { lat: xx, lng: yy };

      // 시작점부터 현재 위치까지의 거리 계산
      let segmentDistance = 0;
      for (let j = 0; j < i; j++) {
        segmentDistance += calculateDistance(
          nodes[j].lat,
          nodes[j].lng,
          nodes[j + 1].lat,
          nodes[j + 1].lng,
        );
      }
      segmentDistance += calculateDistance(start.lat, start.lng, xx, yy);
      totalDistance = segmentDistance;
    }
  }

  return {
    segmentIndex: bestSegment,
    distanceFromStart: totalDistance,
    nearestPoint: bestPoint,
  };
}

// ---------------- API 타입/유틸 ----------------
type FavoriteDetailResponse = {
  success: string | boolean;
  data: {
    id: number;
    name: string;
    waypoints: string[] | Array<[number, number]>;
    savedPolyline: string;
    distanceM: number;
    durationS: number;
    createdAt: string;
  };
};

function normalizeWaypoints(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  // "35.891,128.6149"[]
  if (raw.length > 0 && typeof raw[0] === 'string') {
    return (raw as string[])
      .map((s) => s.split(',').map((v) => parseFloat(String(v).trim())))
      .filter((p) => p.length === 2 && p.every((n) => Number.isFinite(n))) as [
      number,
      number,
    ][];
  }
  // [[lat,lng], ...] (string|number)
  return (raw as any[])
    .map((pair) => {
      if (!Array.isArray(pair) || pair.length < 2) return null;
      const a = pair[0],
        b = pair[1];
      const lat = typeof a === 'string' ? parseFloat(a) : a;
      const lng = typeof b === 'string' ? parseFloat(b) : b;
      return Number.isFinite(lat) && Number.isFinite(lng)
        ? ([lat, lng] as [number, number])
        : null;
    })
    .filter(Boolean) as [number, number][];
}

function toNodes(waypoints: [number, number][]): GraphNode[] {
  return waypoints.map(([lat, lng], i) => ({
    id: i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : `n${i}`,
    lat,
    lng,
  }));
}

function seqLinks(
  nodes: GraphNode[],
  completedSegments: number = -1,
): GraphLink[] {
  const links: GraphLink[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      id: `seg-${i}`,
      from: nodes[i].id,
      to: nodes[i + 1].id,
      color: i <= completedSegments ? COLOR_DONE : COLOR_TODO,
    });
  }
  return links;
}

function formatClock(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatPace(distanceKm: number, timeMs: number): string {
  if (distanceKm === 0 || timeMs === 0) return '0\'00"';

  const timeMin = timeMs / 60000; // 밀리초를 분으로 변환
  const paceMinPerKm = timeMin / distanceKm; // 분/km

  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.floor((paceMinPerKm - minutes) * 60);

  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
}

export default function StartPage() {
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const favoriteId = qs.get('favoriteId');

  const [nodes, setNodes] = useState<GraphNode[]>(MOCK_NODES);
  const [links, setLinks] = useState<GraphLink[]>(buildMockLinks());
  const [routeName, setRouteName] = useState<string>('');
  const [targetKm, setTargetKm] = useState<number>(0);
  const [totalRouteDistance, setTotalRouteDistance] = useState<number>(0);
  const [planDurationMin, setPlanDurationMin] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(!!favoriteId);
  const [error, setError] = useState<string | null>(null);

  const [control, setControl] = useState<ControlState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [distanceRun, setDistanceRun] = useState<number>(0); // 미터 단위
  const [completedSegments, setCompletedSegments] = useState<number>(-1);

  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<LatLng | null>(null);

  // 전체 경로 거리 계산
  const calculateTotalDistance = (pathNodes: GraphNode[]): number => {
    let total = 0;
    for (let i = 0; i < pathNodes.length - 1; i++) {
      total += calculateDistance(
        pathNodes[i].lat,
        pathNodes[i].lng,
        pathNodes[i + 1].lat,
        pathNodes[i + 1].lng,
      );
    }
    return total;
  };

  useEffect(() => {
    let ignore = false;

    async function loadFavorite() {
      if (!favoriteId) {
        // 목데이터의 전체 거리 계산
        const mockDistance = calculateTotalDistance(MOCK_NODES);
        setTotalRouteDistance(mockDistance);
        setTargetKm(mockDistance / 1000);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get<FavoriteDetailResponse>(
          `/api/favorites/${favoriteId}`,
          {
            params: { userId: USER_ID },
          },
        );

        const ok =
          data?.success === 'true' || data?.success === true || !!data?.data;
        if (!ok) throw new Error('응답 포맷 오류');

        const wps = normalizeWaypoints(data.data.waypoints);
        if (wps.length < 2) throw new Error('경로 데이터가 없습니다.');

        const ns = toNodes(wps);
        const totalDistance = data.data.distanceM || calculateTotalDistance(ns);

        if (ignore) return;
        setNodes(ns);
        setTotalRouteDistance(totalDistance);
        setRouteName(data.data.name || `즐겨찾기 #${data.data.id}`);
        setTargetKm(totalDistance / 1000);
        setPlanDurationMin(Math.round(data.data.durationS / 60));
      } catch (e: any) {
        if (ignore) return;
        console.error('❌ 즐겨찾기 상세 조회 실패:', e);
        setError(e?.message ?? '즐겨찾기 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFavorite();
    return () => {
      ignore = true;
    };
  }, [favoriteId]);

  // GPS 위치 추적
  useEffect(() => {
    if (control === 'running') {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
      };

      const success = (position: GeolocationPosition) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentPosition(newPos);

        // 이전 위치가 있으면 이동 거리 계산
        if (lastPositionRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newPos.lat,
            newPos.lng,
          );

          // 최소 이동 거리 필터 (GPS 오차 보정)
          if (distance > 2) {
            // 2미터 이상 이동했을 때만 업데이트
            setDistanceRun((prev) => prev + distance);

            // 경로 상의 진행 상황 업데이트
            const pathInfo = findNearestPointOnPath(newPos, nodes);
            setCompletedSegments(pathInfo.segmentIndex);
          }
        }

        lastPositionRef.current = newPos;
      };

      const error = (err: GeolocationPositionError) => {
        console.error('GPS 오류:', err);
        setError('위치 정보를 가져올 수 없습니다.');
      };

      watchIdRef.current = navigator.geolocation.watchPosition(
        success,
        error,
        options,
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [control, nodes]);

  // 링크 색상 업데이트
  useEffect(() => {
    setLinks(seqLinks(nodes, completedSegments));
  }, [nodes, completedSegments]);

  // 타이머
  useEffect(() => {
    const loop = (now: number) => {
      if (control !== 'running') return;
      if (lastTickRef.current == null) lastTickRef.current = now;
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsed((prev) => prev + delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    if (control === 'running') {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      lastTickRef.current = null;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [control]);

  const handlePlay = () => setControl('running');
  const handlePause = () => setControl('paused');
  const handleStop = () => {
    setControl('idle');
    setElapsed(0);
    setDistanceRun(0);
    setCompletedSegments(-1);
    setCurrentPosition(null);
    lastPositionRef.current = null;
  };

  const clock = formatClock(elapsed);
  const distanceKm = distanceRun / 1000;
  const remainingKm = Math.max(0, (totalRouteDistance - distanceRun) / 1000);
  const pace = formatPace(distanceKm, elapsed);

  return (
    <div className="relative h-dvh w-full bg-white">
      <div className="absolute inset-0">
        <RouteFromLinks
          nodes={nodes}
          links={links}
          showStartPin={true}
          showEndPin={false}
          currentPosition={currentPosition}
          followUser={control === 'running'}
        />
      </div>
      {loading && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-white/60">
          즐겨찾기 경로 불러오는 중…
        </div>
      )}
      {!loading && error && (
        <div className="absolute left-1/2 top-4 z-40 -translate-x-1/2 rounded bg-red-500 px-3 py-2 text-sm text-white shadow">
          {error}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50">
        <div className="w-full px-0 pb-[env(safe-area-inset-bottom)]">
          <div className="pointer-events-auto w-full bg-white p-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-2 gap-y-6">
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  {pace}
                </div>
                <div className="mt-1 text-sem16 text-gray1">평균 페이스</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  {clock}
                </div>
                <div className="mt-1 text-sem16 text-gray1">시간</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  {distanceKm.toFixed(2)}
                </div>
                <div className="mt-1 text-sem16 text-gray1">달린 거리</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  {remainingKm.toFixed(2)}
                </div>
                <div className="mt-1 text-sem16 text-gray1">남은 거리</div>
              </div>
            </div>

            {/* 컨트롤 */}
            <div className="mt-8 flex items-center justify-center gap-6">
              {control === 'idle' && (
                <button
                  onClick={handlePlay}
                  className="grid h-[100px] w-[100px] place-items-center rounded-full bg-main3 text-black"
                >
                  <IcSvgPlay width={32} />
                </button>
              )}

              {control === 'running' && (
                <button
                  onClick={handlePause}
                  className="grid h-[100px] w-[100px] place-items-center rounded-full bg-black text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="block h-8 w-2 rounded-sm bg-white" />
                    <span className="block h-8 w-2 rounded-sm bg-white" />
                  </div>
                </button>
              )}

              {control === 'paused' && (
                <>
                  <button
                    onClick={handleStop}
                    // TODO : 버튼 클릭시 페이지 이동 로직 수정
                    className="grid h-[100px] w-[100px] place-items-center rounded-full bg-black text-white"
                  >
                    <span className="block h-6 w-6 rounded-[2px] bg-white" />
                  </button>

                  <button
                    onClick={handlePlay}
                    className="grid h-[100px] w-[100px] place-items-center rounded-full bg-main3 text-black"
                  >
                    <IcSvgPlay width={34} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
