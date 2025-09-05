'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import IcSvgPlay from '../../shared/icons/ic_play';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = {
  id: string;
  from: string;
  to: string;
  geometry?: LatLng[]; // 있으면 이 폴리라인 길이로, 없으면 from~to 직선거리로 계산
  color?: string;
};

// ✅ 목데이터
const NODES: GraphNode[] = [
  { id: 'A', lat: 35.89065, lng: 128.6109 },
  { id: 'B', lat: 35.89005, lng: 128.6098 },
  { id: 'C', lat: 35.88895, lng: 128.60895 },
  { id: 'D', lat: 35.8877, lng: 128.6082 },
  { id: 'E', lat: 35.8872, lng: 128.6094 },
  { id: 'F', lat: 35.8881, lng: 128.6117 },
];

const COLOR_DONE = '#37DE61';
const COLOR_TODO = '#D9D9D9';

function buildLinks(): GraphLink[] {
  const pairs: Array<[string, string, string]> = [
    ['A', 'B', COLOR_DONE],
    ['B', 'C', COLOR_DONE],
    ['C', 'D', COLOR_DONE],
    ['D', 'E', COLOR_DONE],
    ['E', 'F', COLOR_DONE],
    ['F', 'A', COLOR_TODO],
  ];
  return pairs.map(([from, to, color], i) => ({
    id: `seg-${i}`,
    from,
    to,
    color,
  }));
}

/* ------------------ 거리/표시 유틸 ------------------ */

// 위경도 거리(m). 하버사인
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000; // m
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}

// 폴리라인 길이(m)
function polylineLength(points: LatLng[]): number {
  if (!points || points.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    sum += haversine(points[i - 1], points[i]);
  }
  return sum;
}

// 링크 길이(m): geometry 우선, 없으면 from~to 직선
function linkLengthM(link: GraphLink, nodeMap: Map<string, GraphNode>): number {
  if (link.geometry && link.geometry.length > 1) {
    return polylineLength(link.geometry);
  }
  const from = nodeMap.get(link.from);
  const to = nodeMap.get(link.to);
  if (!from || !to) return 0;
  return haversine(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng },
  );
}

function formatClock(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// 평균 페이스(분/㎞) -> "mʹssʺ". 거리 0이면 "0ʹ00ʺ"
function formatPace(totalMs: number, distanceKm: number) {
  if (!distanceKm || distanceKm <= 0) return '0ʹ00ʺ';
  const minPerKm = totalMs / 1000 / 60 / distanceKm; // 분/킬로
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  const ss = String(s).padStart(2, '0');
  return `${m}ʹ${ss}ʺ`;
}

type ControlState = 'idle' | 'running' | 'paused';

export default function StartPage() {
  const nodes = useMemo(() => NODES, []);
  const links = useMemo(() => buildLinks(), []);

  // 코스 총 거리(km) 계산 (렌더당 1회)
  const plannedDistanceKm = useMemo(() => {
    const map = new Map(nodes.map((n) => [n.id, n]));
    const totalM = links.reduce((acc, l) => acc + linkLengthM(l, map), 0);
    return totalM / 1000;
  }, [nodes, links]);

  const [control, setControl] = useState<ControlState>('idle');
  const [elapsed, setElapsed] = useState(0); 
  const [distanceM, setDistanceM] = useState(0); 
  const [lastPoint, setLastPoint] = useState<LatLng | null>(null);

  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // 시간 루프
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

  useEffect(() => {
    if (control !== 'running') {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      alert('이 기기/브라우저는 위치 서비스를 지원하지 않아요.');
      setControl('paused');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const point: LatLng = { lat: latitude, lng: longitude };

        if (typeof accuracy === 'number' && accuracy > 40) return;

        setLastPoint((prev) => {
          if (!prev) return point;

          // 이동 거리 계산
          const stepM = haversine(prev, point);

          if (typeof speed === 'number' && !Number.isNaN(speed)) {
            if (speed > 8) return prev;
          } else {
            if (stepM > 50) return prev;
          }

          setDistanceM((d) => d + stepM);
          return point;
        });
      },
      (err) => {
        console.error(err);
        alert('위치 권한을 확인해 주세요.');
        setControl('paused');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000, // 1초 내 캐시 허용
        timeout: 15000,
      },
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [control]);

  const handlePlay = () => {
    // 처음 시작할 때 기준점 초기화
    if (control === 'idle') {
      setElapsed(0);
      setDistanceM(0);
      setLastPoint(null);
    }
    setControl('running');
  };
  const handlePause = () => setControl('paused');
  const handleStop = () => {
    setControl('idle');
    setElapsed(0);
    setDistanceM(0);
    setLastPoint(null);
  };

  const clock = formatClock(elapsed);
  const distanceKm = useMemo(() => distanceM / 1000, [distanceM]);
  const remainKm = Math.max(0, plannedDistanceKm - distanceKm);
  const avgPace = formatPace(elapsed, distanceKm);

  return (
    <div className="relative h-dvh w-full bg-white">
      {/* 지도/코스 렌더 */}
      <div className="absolute inset-0">
        <RouteFromLinks
          nodes={nodes}
          links={links}
          showStartPin={false}
          showEndPin={false}
        />
      </div>

      {/* 하단 정보/컨트롤 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50">
        <div className="w-full px-0 pb-[env(safe-area-inset-bottom)]">
          <div className="pointer-events-auto w-full bg-white p-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-2 gap-y-6">
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  {avgPace}
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
                <div className="mt-1 text-sem16 text-gray1">달린 거리 (km)</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  {remainKm.toFixed(2)}
                </div>
                <div className="mt-1 text-sem16 text-gray1">남은 거리 (km)</div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6">
              {control === 'idle' && (
                // ▶
                <button
                  onClick={handlePlay}
                  className="grid h-[100px] w-[100px] place-items-center rounded-full bg-main3 text-black"
                >
                  <IcSvgPlay width={32} />
                </button>
              )}

              {control === 'running' && (
                // ❚❚
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
