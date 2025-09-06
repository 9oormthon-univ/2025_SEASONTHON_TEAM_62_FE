import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import StartRunModal from './components/startRunModal';
import api from '../../shared/apis/api'; // axios 인스턴스 (withCredentials 설정되어 있음)

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = { id: string; from: string; to: string; color?: string };

type PlanCard = {
  id: 'safe' | 'normal' | 'fast';
  label: '안전' | '보통' | '최단';
  distanceKm: number;
  steps: number;
  etaText: string; // 예: "31분" 또는 "1시간 5분"
  color: string;
};

const PLAN_COLORS: Record<'safe' | 'normal' | 'fast', string> = {
  safe: '#37DE61',
  normal: '#FFDA46',
  fast: '#FFA42C',
};

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL as string;
const USER_ID = 7;

// ----------------------- 유틸 -----------------------

function normalizeWaypoints(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];

  // "35.891,128.6149"[] 형태
  if (raw.length > 0 && typeof raw[0] === 'string') {
    return (raw as string[])
      .map((s) => s.split(',').map((v) => parseFloat(String(v).trim())))
      .filter((p) => p.length === 2 && p.every((n) => Number.isFinite(n)))
      .map(([lat, lng]) => [lat, lng]);
  }

  // [[lat,lng], ...] 형태
  return (raw as any[])
    .map((pair) => {
      if (!Array.isArray(pair) || pair.length < 2) return null;
      const a = pair[0];
      const b = pair[1];
      const lat = typeof a === 'string' ? parseFloat(a) : a;
      const lng = typeof b === 'string' ? parseFloat(b) : b;
      return Number.isFinite(lat) && Number.isFinite(lng)
        ? ([lat, lng] as [number, number])
        : null;
    })
    .filter(Boolean) as [number, number][];
}

function toNodesAndLinks(waypoints: [number, number][]) {
  const nodes: GraphNode[] = waypoints.map(([lat, lng], i) => ({
    id: i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : `n${i}`,
    lat,
    lng,
  }));
  const links: GraphLink[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({ id: `seg-${i}`, from: nodes[i].id, to: nodes[i + 1].id });
  }
  return { nodes, links };
}

function etaTextFromMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? `${h}시간 ` : ''}${m}분`;
}

function estimateSteps(km: number) {
  return Math.round(km * 1300);
}

// ---------------- 기본 좌표 & 목데이터 ----------------

const DEFAULT_POINTS: LatLng[] = [
  { lat: 35.8887, lng: 128.6111 },
  { lat: 35.8881, lng: 128.6129 },
  { lat: 35.8871, lng: 128.6125 },
  { lat: 35.8866, lng: 128.611 },
  { lat: 35.8864, lng: 128.609 },
  { lat: 35.8878, lng: 128.6079 },
  { lat: 35.8898, lng: 128.6089 },
  { lat: 35.8906, lng: 128.6109 },
  { lat: 35.891, lng: 128.6149 },
];

const MOCK_RECOMMEND_RESPONSE = {
  routes: [
    {
      type: 'safe',
      distance_km: 5.1,
      safety_score: 92,
      estimated_time_min: 31,
      waypoints: [
        [DEFAULT_POINTS[0].lat, DEFAULT_POINTS[0].lng],
        [DEFAULT_POINTS[1].lat, DEFAULT_POINTS[1].lng],
        [DEFAULT_POINTS[2].lat, DEFAULT_POINTS[2].lng],
        [DEFAULT_POINTS[3].lat, DEFAULT_POINTS[3].lng],
        [DEFAULT_POINTS[4].lat, DEFAULT_POINTS[4].lng],
        [DEFAULT_POINTS[5].lat, DEFAULT_POINTS[5].lng],
        [DEFAULT_POINTS[6].lat, DEFAULT_POINTS[6].lng],
        [DEFAULT_POINTS[7].lat, DEFAULT_POINTS[7].lng],
        [DEFAULT_POINTS[8].lat, DEFAULT_POINTS[8].lng],
      ],
    },
    {
      type: 'balanced',
      distance_km: 5.0,
      safety_score: 75,
      estimated_time_min: 30,
      waypoints: [
        [DEFAULT_POINTS[0].lat, DEFAULT_POINTS[0].lng],
        [DEFAULT_POINTS[2].lat, DEFAULT_POINTS[2].lng],
        [DEFAULT_POINTS[3].lat, DEFAULT_POINTS[3].lng],
        [DEFAULT_POINTS[5].lat, DEFAULT_POINTS[5].lng],
        [DEFAULT_POINTS[7].lat, DEFAULT_POINTS[7].lng],
        [DEFAULT_POINTS[8].lat, DEFAULT_POINTS[8].lng],
      ],
    },
    {
      type: 'shortest',
      distance_km: 4.9,
      safety_score: 60,
      estimated_time_min: 29,
      waypoints: [
        [DEFAULT_POINTS[0].lat, DEFAULT_POINTS[0].lng],
        [DEFAULT_POINTS[3].lat, DEFAULT_POINTS[3].lng],
        [DEFAULT_POINTS[6].lat, DEFAULT_POINTS[6].lng],
        [DEFAULT_POINTS[8].lat, DEFAULT_POINTS[8].lng],
      ],
    },
  ],
} as const;

type ApiRoute = {
  type: 'safe' | 'balanced' | 'shortest';
  distance_km: number;
  safety_score: number;
  estimated_time_min: number;
  waypoints: unknown;
};
type ApiResponse = { routes: ApiRoute[] };

// ------------------- 컴포넌트 -------------------

export default function PathPage() {
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const startName = qs.get('start') ?? '경북대학교 정문';
  const targetDistanceKm = Number(qs.get('distance') ?? '5');
  const paceMin = Number(qs.get('paceMin') ?? '6');
  const paceSec = Number(qs.get('paceSec') ?? '0');
  const targetPace = `${paceMin}'${String(paceSec).padStart(2, '0')}"`;

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [usedMock, setUsedMock] = useState(false);

  // 추천 결과 저장
  const [routeMap, setRouteMap] = useState<
    Partial<
      Record<
        'safe' | 'normal' | 'fast',
        {
          nodes: GraphNode[];
          links: GraphLink[];
          distanceKm: number;
          etaMin: number;
        }
      >
    >
  >({});

  // 즐겨찾기 상태
  const [savingMap, setSavingMap] = useState<
    Record<'safe' | 'normal' | 'fast', boolean>
  >({
    safe: false,
    normal: false,
    fast: false,
  });
  const [favoritedMap, setFavoritedMap] = useState<
    Record<'safe' | 'normal' | 'fast', boolean>
  >({
    safe: false,
    normal: false,
    fast: false,
  });

  const [selectedId, setSelectedId] = useState<'safe' | 'normal' | 'fast'>(
    'safe',
  );
  const current = routeMap[selectedId];

  useEffect(() => {
    const startPoint = DEFAULT_POINTS[0]; // 실제 시작 좌표가 있으면 대입
    const body = {
      start_point: [startPoint.lat, startPoint.lng],
      distance_km: targetDistanceKm,
      pace_min_per_km: paceMin + paceSec / 60,
    };

    let ignore = false;
    (async () => {
      setLoading(true);
      setUsedMock(false);
      try {
        const res = await fetch(`${API_BASE}/api/routes/recommend`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();

        const next: typeof routeMap = {};
        data.routes.forEach((r) => {
          const wps = normalizeWaypoints(r.waypoints);
          if (wps.length < 2) return;
          const { nodes, links } = toNodesAndLinks(wps);
          const id: 'safe' | 'normal' | 'fast' =
            r.type === 'safe'
              ? 'safe'
              : r.type === 'balanced'
                ? 'normal'
                : 'fast';
          next[id] = {
            nodes,
            links,
            distanceKm: r.distance_km,
            etaMin: r.estimated_time_min,
          };
        });

        if (!ignore) setRouteMap(next);
      } catch {
        // 실패 시 목데이터
        const next: typeof routeMap = {};
        MOCK_RECOMMEND_RESPONSE.routes.forEach((r) => {
          const wps = normalizeWaypoints(r.waypoints);
          const { nodes, links } = toNodesAndLinks(wps);
          const id: 'safe' | 'normal' | 'fast' =
            r.type === 'safe'
              ? 'safe'
              : r.type === 'balanced'
                ? 'normal'
                : 'fast';
          next[id] = {
            nodes,
            links,
            distanceKm: r.distance_km,
            etaMin: r.estimated_time_min,
          };
        });
        if (!ignore) {
          setRouteMap(next);
          setUsedMock(true);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [targetDistanceKm, paceMin, paceSec]);

  // 카드 데이터
  const planCards: PlanCard[] = useMemo(() => {
    return (['safe', 'normal', 'fast'] as const).map((id) => {
      const meta = routeMap[id];
      const dist = meta?.distanceKm ?? targetDistanceKm;
      const minutes = meta?.etaMin ?? Math.round(targetDistanceKm * paceMin);
      return {
        id,
        label: id === 'safe' ? '안전' : id === 'normal' ? '보통' : '최단',
        distanceKm: Number(dist.toFixed(1)),
        steps: estimateSteps(dist),
        etaText: etaTextFromMinutes(minutes),
        color: PLAN_COLORS[id],
      };
    });
  }, [routeMap, targetDistanceKm, paceMin]);

  const handleStart = () => {
    setIsOpen(false);
    navigate(`/running/start`);
  };

  // 즐겨찾기 생성
  async function handleFavoriteCreate(id: 'safe' | 'normal' | 'fast') {
    if (favoritedMap[id]) return; // 이미 생성됨
    const meta = routeMap[id];
    if (!meta || meta.nodes.length < 2) {
      alert('경로 데이터가 없습니다.');
      return;
    }

    try {
      setSavingMap((m) => ({ ...m, [id]: true }));

      // 서버 스펙 상 waypoints는 [[lat,lng], ...] (숫자 쌍 배열)로 전송
      const waypoints: [number, number][] = meta.nodes.map((n) => [
        Number(n.lat.toFixed(6)),
        Number(n.lng.toFixed(6)),
      ]);

      const body = {
        userId: USER_ID,
        name: `${startName} 추천경로 - ${id === 'safe' ? '안전' : id === 'normal' ? '보통' : '최단'}`,
        waypoints,
        savedPolyline: '', // 필요시 서버에서 생성/무시
        distanceM: Math.round(meta.distanceKm * 1000),
        durationS: Math.round(meta.etaMin * 60),
      };

      const { data } = await api.post('/api/favorites', body);
      const ok =
        data?.success === 'true' ||
        data?.success === true ||
        !('success' in data);
      if (!ok) throw new Error(data?.msg || '즐겨찾기 생성 실패');

      setFavoritedMap((m) => ({ ...m, [id]: true }));
      // UX: 간단 알림
      console.log('✅ 즐겨찾기 생성 완료:', data);
    } catch (e: any) {
      console.error('❌ 즐겨찾기 생성 실패:', e);
      alert(e?.message ?? '즐겨찾기 생성에 실패했습니다.');
    } finally {
      setSavingMap((m) => ({ ...m, [id]: false }));
    }
  }

  // 현재 선택 경로 노출(없으면 시작점만)
  const nodes = current?.nodes ?? [{ id: 'start', ...DEFAULT_POINTS[0] }];
  const links = (current?.links ?? []).map((l, i) => ({
    ...l,
    id: l.id ?? `seg-${i}`,
    color: PLAN_COLORS[selectedId],
  }));

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center bg-white px-4 pb-4 pt-[12px]">
        <button
          aria-label="뒤로"
          className="grid h-9 w-9 place-items-center rounded-full"
          onClick={() => history.back()}
        >
          <IcSvgLeftArrow2 width={7} />
        </button>
        <div className="flex-grow text-center">
          <h1 className="pr-3 text-med18">경로 찾기</h1>
        </div>
      </div>

      {/* 요약 */}
      <div className="border-b px-6 pb-3 shadow-2xl">
        <InfoRow
          label="출발지점"
          value={startName}
        />
        <InfoRow
          label="거리"
          value={`${(routeMap[selectedId]?.distanceKm ?? targetDistanceKm).toFixed(1)}km${
            usedMock ? ' · 목데이터' : ''
          }`}
        />
        <InfoRow
          label="목표 페이스"
          value={targetPace}
        />
      </div>

      {/* 지도 + 카드 */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-white/60">
            추천 경로 계산중…
          </div>
        )}

        <RouteFromLinks
          nodes={nodes}
          links={links}
          showStartPin={false}
          showEndPin={false}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(56px+12px+env(safe-area-inset-bottom))] z-40">
          <div className="mx-auto w-full max-w-[560px] px-4">
            <div className="rounded-3xl p-3">
              <div
                className="
                  pointer-events-auto flex gap-3 overflow-x-auto pb-1
                  snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]
                  [touch-action:pan-x] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden
                "
                style={{ scrollbarWidth: 'none' }}
              >
                {planCards.map((c) => (
                  <PlanCardItem
                    key={c.id}
                    item={c}
                    selected={selectedId === c.id}
                    onClick={() => setSelectedId(c.id)}
                    onFavorite={() => handleFavoriteCreate(c.id)}
                    favorited={favoritedMap[c.id]}
                    saving={savingMap[c.id]}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="flex w-full justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto h-14 w-full max-w-[430px] bg-main3 px-4 text-sem16 text-white pb-[env(safe-area-inset-bottom)]"
          >
            러닝 시작하기
          </button>
        </div>
      </div>

      <StartRunModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onStart={handleStart}
        planId={selectedId}
        startName={startName}
        distanceKm={routeMap[selectedId]?.distanceKm ?? targetDistanceKm}
      />
    </div>
  );
}

// ------------------- 서브 컴포넌트 -------------------

function PlanCardItem({
  item,
  selected,
  onClick,
  onFavorite,
  favorited,
  saving,
}: {
  item: PlanCard;
  selected: boolean;
  onClick: () => void;
  onFavorite: () => void;
  favorited: boolean;
  saving: boolean;
}) {
  const TAG_BG: Record<PlanCard['id'], string> = {
    safe: '#B3FFC6',
    normal: '#FFFAB3',
    fast: '#FFDFB3',
  };

  // "1시간 5분" 또는 "31분"에서 시/분 추출
  const hh = item.etaText.match(/(\d+)\s*시간/);
  const mm = item.etaText.match(/(\d+)\s*분/);
  const hours = hh?.[1] ?? ''; // 없다면 빈 문자열
  const mins = mm?.[1] ?? '';

  return (
    <button
      onClick={onClick}
      className={[
        'snap-start pointer-events-auto h-[110px] w-[140px] shrink-0 rounded-[8px] bg-white px-3 py-2 text-left',
        selected ? 'border-[2px] border-main3' : 'border-[2px] border-white',
      ].join(' ')}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-reg12"
          style={{ background: TAG_BG[item.id], color: '#111827' }}
        >
          {item.label}
        </span>

        {/* 하트 버튼 (카드 클릭과 분리) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!saving) onFavorite();
          }}
          className="grid h-6 w-6 place-items-center"
          aria-label={favorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {saving ? (
            <span className="text-xs">…</span>
          ) : favorited ? (
            <span className="text-lg">❤️</span>
          ) : (
            <span className="text-lg text-main3">♡</span>
          )}
        </button>
      </div>

      {/* 시간 표시: '분만 있으면 시간 텍스트 제거' */}
      <div className="flex whitespace-nowrap tabular-nums leading-none items-baseline">
        {hours && (
          <>
            <span className="text-[28px] font-extrabold tracking-tight">
              {hours}
            </span>
            <span className="text-[16px] font-medium mr-1">시간</span>
          </>
        )}
        <span className="text-[28px] font-extrabold tracking-tight">
          {mins}
        </span>
        <span className="text-[16px] font-medium">분</span>
      </div>

      <div className="mt-1 text-[13px] text-gray1">
        {item.distanceKm.toFixed(1)}km · {item.steps.toLocaleString()}걸음
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-center gap-6">
      <div className="w-20 text-med14 text-black">{label}</div>
      <div className="text-sem16 text-black">{value}</div>
    </div>
  );
}
