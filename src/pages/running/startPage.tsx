
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import IcSvgPlay from '../../shared/icons/ic_play';
import api from '../../shared/apis/api';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = { id: string; from: string; to: string; color?: string };

type ControlState = 'idle' | 'running' | 'paused';

const COLOR_DONE = '#37DE61';
const COLOR_TODO = '#D9D9D9';
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
function seqLinks(nodes: GraphNode[], color = COLOR_TODO): GraphLink[] {
  const links: GraphLink[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      id: `seg-${i}`,
      from: nodes[i].id,
      to: nodes[i + 1].id,
      color,
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

export default function StartPage() {
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const favoriteId = qs.get('favoriteId');

  const [nodes, setNodes] = useState<GraphNode[]>(MOCK_NODES);
  const [links, setLinks] = useState<GraphLink[]>(buildMockLinks());
  const [routeName, setRouteName] = useState<string>('');
  const [targetKm, setTargetKm] = useState<number>(0);
  const [planDurationMin, setPlanDurationMin] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(!!favoriteId);
  const [error, setError] = useState<string | null>(null);

  const [control, setControl] = useState<ControlState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadFavorite() {
      if (!favoriteId) return;
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
        const ls = seqLinks(ns, COLOR_TODO);

        if (ignore) return;
        setNodes(ns);
        setLinks(ls);
        setRouteName(data.data.name || `즐겨찾기 #${data.data.id}`);
        setTargetKm(Number((data.data.distanceM / 1000).toFixed(1)));
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
          showStartPin={true}
          showEndPin={false}
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
                  {targetKm > 0 ? targetKm.toFixed(2) : '0.00'}
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
