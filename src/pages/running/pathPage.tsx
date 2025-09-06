import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import StartRunModal from './components/startRunModal';
import api from '../../shared/apis/api';
import { useUserStore } from '../../store/useUserStore';
import {
  estimateSteps,
  normalizeWaypoints,
  toNodesAndLinks,
} from './utils/running';
import { InfoRow, PlanCardItem } from './components/path';

type LatLng = { lat: number; lng: number };
export type GraphNode = { id: string; lat: number; lng: number };
export type GraphLink = {
  id: string;
  from: string;
  to: string;
  color?: string;
};

export type PlanCard = {
  id: 'safe' | 'normal' | 'fast';
  label: '안전' | '보통' | '최단';
  distanceKm: number;
  steps: number;
  etaText: string;
  color: string;
  safetyScore: number;
};

const PLAN_COLORS: Record<'safe' | 'normal' | 'fast', string> = {
  safe: '#37DE61',
  normal: '#FFDA46',
  fast: '#FFA42C',
};


const DEFAULT_START_POINT: LatLng = { lat: 35.8887, lng: 128.6111 };

type ApiRoute = {
  type: 'safe' | 'balanced' | 'shortest';
  distance_km: number;
  safety_score: number;
  estimated_time_min: number;
  waypoints: unknown;
};
type ApiResponse = { routes: ApiRoute[] };

// ---------------- 컴포넌트 ----------------

export default function PathPage() {
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const userId = useUserStore((s) => s.userId);

  const startName = qs.get('start') ?? '경북대학교 정문';
  const targetDistanceKm = Number(qs.get('distance') ?? '5');
  const paceMin = Number(qs.get('paceMin') ?? '6');
  const paceSec = Number(qs.get('paceSec') ?? '0');
  const targetPace = `${paceMin}'${String(paceSec).padStart(2, '0')}"`;

  const [isOpen, setIsOpen] = useState(false);
  const [startingRun, setStartingRun] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [routeMap, setRouteMap] = useState<
    Partial<
      Record<
        'safe' | 'normal' | 'fast',
        {
          nodes: GraphNode[];
          links: GraphLink[];
          distanceKm: number;
          etaMin: number;
          safetyScore: number;
        }
      >
    >
  >({});

  // 즐겨찾기 생성/삭제 상태
  const [savingMap, setSavingMap] = useState<
    Record<'safe' | 'normal' | 'fast', boolean>
  >({ safe: false, normal: false, fast: false });

  const [favoritedMap, setFavoritedMap] = useState<
    Record<'safe' | 'normal' | 'fast', boolean>
  >({ safe: false, normal: false, fast: false });

  // 생성된 favorite의 서버 ID 저장(삭제용)
  const [favoriteIdMap, setFavoriteIdMap] = useState<
    Record<'safe' | 'normal' | 'fast', number | null>
  >({ safe: null, normal: null, fast: null });

  const [selectedId, setSelectedId] = useState<'safe' | 'normal' | 'fast'>(
    'safe',
  );
  const current = routeMap[selectedId];

  // 추천 API 호출
  useEffect(() => {
    const startPoint = DEFAULT_START_POINT;
    const body = {
      start_point: [startPoint.lat, startPoint.lng],
      distance_km: targetDistanceKm,
      pace_min_per_km: paceMin + paceSec / 60,
    };

    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://192.0.0.2:9000/api/routes/recommend`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );

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
            safetyScore: r.safety_score,
          };
        });

        if (!ignore) setRouteMap(next);
      } catch (error) {
        console.error('경로 추천 API 호출 실패:', error);
        if (!ignore) {
          alert('경로를 불러오는데 실패했습니다. 다시 시도해주세요.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [targetDistanceKm, paceMin, paceSec]);

  function etaTextFromMinutes(mins: number) {
    if (!Number.isFinite(mins)) return '—';
    const total = Math.round(mins);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  }

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
        safetyScore: meta?.safetyScore ?? 0,
      };
    });
  }, [routeMap, targetDistanceKm, paceMin]);

  const handleStart = async () => {
    const selectedRoute = routeMap[selectedId];

    if (!selectedRoute || !selectedRoute.nodes.length) {
      alert('선택된 경로가 없습니다.');
      return;
    }

    setStartingRun(true);

    try {
      const waypoints: [number, number][] = selectedRoute.nodes.map((n) => [
        Number(n.lat.toFixed(6)),
        Number(n.lng.toFixed(6)),
      ]);

      const start = selectedRoute.nodes[0];
      const savedPolyline = `${start.lat.toFixed(6)},${start.lng.toFixed(6)}`;

      await api.post('/api/recent-paths/complete', {
        waypoints,
        savedPolyline,
      });

      setIsOpen(false);
      navigate('/running/start');
    } catch (error: any) {
      console.error('경로 완주 저장 실패:', error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        '러닝을 시작하는데 실패했습니다.';
      alert(`${msg} 다시 시도해주세요.`);
    } finally {
      setStartingRun(false);
    }
  };

  async function toggleFavorite(id: 'safe' | 'normal' | 'fast', next: boolean) {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const meta = routeMap[id];
    if (!meta || meta.nodes.length < 2) {
      alert('경로 데이터가 없습니다.');
      return;
    }
    setSavingMap((m) => ({ ...m, [id]: true }));
    setFavoritedMap((m) => ({ ...m, [id]: next }));

    try {
      if (next) {
        const waypoints: [number, number][] = meta.nodes.map((n) => [
          Number(n.lat.toFixed(6)),
          Number(n.lng.toFixed(6)),
        ]);

        const body = {
          userId: userId,
          name: `${startName} 추천경로 - ${
            id === 'safe' ? '안전' : id === 'normal' ? '보통' : '최단'
          }`,
          waypoints,
          savedPolyline: '',
          distanceM: Math.round(meta.distanceKm * 1000),
          durationS: Math.round(meta.etaMin * 60),
          safetyScore: meta.safetyScore,
          safetyLevel:
            id === 'safe' ? 'SAFE' : id === 'normal' ? 'MEDIUM' : 'UNSAFE',
          tags: [id],
        };

        const { data } = await api.post('/api/favorites', body);
        const favId: number | undefined =
          data?.data?.id ?? data?.id ?? data?.favoriteId;
        if (!favId) throw new Error('즐겨찾기 ID를 받지 못했습니다.');

        setFavoriteIdMap((m) => ({ ...m, [id]: favId }));
      } else {
        // DELETE
        const favId = favoriteIdMap[id];
        if (!favId) {
          // 서버 ID가 없으면 그냥 롤백
          throw new Error('삭제할 즐겨찾기 ID가 없습니다.');
        }
        await api.delete(`/api/favorites/${favId}`, {
          params: { userId: userId },
        });
        setFavoriteIdMap((m) => ({ ...m, [id]: null }));
      }
    } catch (e: any) {
      console.error('❌ 즐겨찾기 토글 실패:', e);
      // 롤백
      setFavoritedMap((m) => ({ ...m, [id]: !next }));
      alert(e?.message ?? '즐겨찾기 처리에 실패했습니다.');
    } finally {
      setSavingMap((m) => ({ ...m, [id]: false }));
    }
  }

  // 현재 선택 경로 노출(없으면 시작점만)
  const nodes = current?.nodes ?? [{ id: 'start', ...DEFAULT_START_POINT }];
  const links = (current?.links ?? []).map((l, i) => ({
    ...l,
    id: l.id ?? `seg-${i}`,
    color: PLAN_COLORS[selectedId],
  }));

  // 경로 데이터가 없는 경우 처리
  const hasRouteData = Object.keys(routeMap).length > 0;

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
          value={`${(
            routeMap[selectedId]?.distanceKm ?? targetDistanceKm
          ).toFixed(1)}km`}
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
            <div className="text-center">
              <div className="mb-2">추천 경로 계산중...</div>
              <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
            </div>
          </div>
        )}

        {!loading && !hasRouteData && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-white/60">
            <div className="text-center">
              <div className="mb-2">경로를 불러올 수 없습니다</div>
              <div className="text-sm text-gray-500">다시 시도해주세요</div>
            </div>
          </div>
        )}

        <RouteFromLinks
          nodes={nodes}
          links={links}
          showStartPin={false}
          showEndPin={false}
        />

        {hasRouteData && (
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
                      favoriteChecked={favoritedMap[c.id]}
                      favoriteLoading={savingMap[c.id]}
                      onFavoriteChange={(next) => toggleFavorite(c.id, next)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="flex w-full justify-center">
          <button
            onClick={() => setIsOpen(true)}
            disabled={!hasRouteData || startingRun}
            className="pointer-events-auto h-14 w-full max-w-[430px] bg-main3 px-4 text-sem16 text-white pb-[env(safe-area-inset-bottom)] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {startingRun ? '러닝 준비중...' : '러닝 시작하기'}
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
