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
  geometry?: LatLng[];
  color?: string;
};

// 목데이터
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

function formatClock(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

type ControlState = 'idle' | 'running' | 'paused';

export default function StartPage() {
  const nodes = useMemo(() => NODES, []);
  const links = useMemo(() => buildLinks(), []);

  const [control, setControl] = useState<ControlState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

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
  };

  const clock = formatClock(elapsed);

  return (
    <div className="relative h-dvh w-full bg-white">
      <div className="absolute inset-0">
        <RouteFromLinks
          nodes={nodes}
          links={links}
          showStartPin={false}
          showEndPin={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50">
        <div className="w-full px-0 pb-[env(safe-area-inset-bottom)]">
          <div className="pointer-events-auto w-full bg-white p-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-2 gap-y-6">
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  0ʹ00ʺ
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
                  0.00
                </div>
                <div className="mt-1 text-sem16 text-gray1">달린 거리</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[44px] font-extrabold tabular-nums">
                  0.00
                </div>
                <div className="mt-1 text-sem16 text-gray1">남은 거리</div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6">
              {control === 'idle' && (
                // ▶만
                <button
                  onClick={handlePlay}
                  className="grid h-[100px] w-[100px] place-items-center rounded-full bg-main3 text-black"
                >
                  <IcSvgPlay width={32} />
                </button>
              )}

              {control === 'running' && (
                // ❚❚만
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
