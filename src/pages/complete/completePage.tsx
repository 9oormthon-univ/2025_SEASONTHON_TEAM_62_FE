import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import { FavoriteIcon } from '../../shared/components/favoriteIcon';
import api from '../../shared/apis/api';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import useWaypointStore from '../../store/useWaypointStore';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type Waypoint = [number, number];
type GraphLink = { id: string; from: string; to: string; color?: string };

type Props = {
  startedAt?: Date | string; // 러닝 끝난 시각 (표기용)
  totalKm?: number; // 총 거리 (km)
  avgPaceText?: string; // 평균 페이스: 00'00"
  durationText?: string; // 시간: 00:00 (mm:ss)
  plan?: 'safe' | 'normal' | 'fast';
  routeName?: string;
  routeDistanceKm?: number;
  /** 아래부터 즐겨찾기 연동용 (없으면 내부에서 API 호출 생략) */
  userId?: number; // 즐겨찾기 생성/삭제 시 필요
  waypoints?: Waypoint[]; // 경로 좌표쌍 [[lat,lng],...]
  safetyScore?: number; // 선택경로의 안전지수(없으면 0)
  isFavorite?: boolean; // 초기 즐겨찾기 여부
  favoriteId?: number | null; // 이미 즐겨찾기인 경우 서버 ID
  onBack?: () => void;
  onToggleFavorite?: (next: boolean) => void; // 부모 위임 시 사용
};

const PLAN_LABEL: Record<NonNullable<Props['plan']>, string> = {
  safe: '안전',
  normal: '보통',
  fast: '최단',
};

const PLAN_TAG_BG: Record<NonNullable<Props['plan']>, string> = {
  safe: '#B3FFC6',
  normal: '#FFFAB3',
  fast: '#FFDFB3',
};

// mm:ss → 초
function parseDurationToSeconds(text?: string): number {
  if (!text) return 0;
  const m = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  const mm = Number(m[1]);
  const ss = Number(m[2]);
  if (!Number.isFinite(mm) || !Number.isFinite(ss)) return 0;
  return mm * 60 + ss;
}

function planToSafetyLevel(
  plan: 'safe' | 'normal' | 'fast',
): 'SAFE' | 'BALANCED' | 'FAST' {
  return plan === 'safe' ? 'SAFE' : plan === 'normal' ? 'BALANCED' : 'FAST';
}

function toNodes(waypoints: [number, number][]): GraphNode[] {
  return waypoints.map(([lat, lng], i) => ({
    id: i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : `n${i}`,
    lat,
    lng,
  }));
}

function seqLinks(nodes: GraphNode[]): GraphLink[] {
  const links: GraphLink[] = [];
  const COLOR_DONE = '#D9D9D9';
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      id: `seg-${i}`,
      from: nodes[i].id,
      to: nodes[i + 1].id,
      color: COLOR_DONE,
    });
  }
  return links;
}

// ---- API 응답 타입 ----
type RecentPath = {
  id: number;
  waypoints: [number, number][];
  usedAt: string;
};

type RecentPathsResponse = {
  success: string | boolean;
  data: RecentPath[];
};

export default function CompletePage({
  startedAt,
  totalKm = 0,
  avgPaceText = `00'00"`,
  durationText = '00:00',
  plan = 'safe',
  routeName = '경북대학교 정문',
  routeDistanceKm = 5,
  /** 즐겨찾기 연동용 */
  userId,
  waypoints: waypointsProp,
  safetyScore = 0,
  isFavorite = false,
  favoriteId: favoriteIdProp = null,
  onBack,
  onToggleFavorite,
}: Props) {
  const location = useLocation();
  const { state } = location;

  const [loading, setLoading] = useState(false);
  const [apiWaypoints, setApiWaypoints] = useState<Waypoint[]>([]);

  // API에서 최신 경로 데이터 불러오기
  useEffect(() => {
    async function fetchRecentPath() {
      // 이미 로컬 상태에 경로 데이터가 있으면 API 호출 건너뛰기
      const { waypoints: storedWaypoints } = useWaypointStore.getState();
      if (storedWaypoints.length > 0) {
        console.log('✅ Zustand 스토어에 저장된 경로를 사용합니다.');
        return;
      }

      try {
        setLoading(true);
        const { data } =
          await api.get<RecentPathsResponse>('/api/recent-paths');
        console.log('✅ API 응답 데이터:', data); // API 응답 확인

        if (data.success && data.data.length > 0) {
          const recentPath = data.data.sort(
            (a, b) =>
              new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime(),
          )[0];
          console.log('✅ 가장 최신 경로 데이터:', recentPath);
          setApiWaypoints(recentPath.waypoints);
        } else {
          console.warn('⚠️ API 응답에 유효한 경로 데이터가 없습니다.');
        }
      } catch (e) {
        console.error('❌ 최근 경로 불러오기 실패:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentPath();
  }, []);

  // URL State에서 데이터 가져오기 (없으면 props의 기본값 사용)
  const finalKm = state?.totalKm ?? totalKm;
  const finalDuration = state?.durationText ?? durationText;
  const finalPace = state?.avgPaceText ?? avgPaceText;

  // Zustand Store에서 최종 경로 데이터 가져오기
  const { waypoints: storedWaypoints } = useWaypointStore();
  const finalWaypoints =
    storedWaypoints.length > 0 ? storedWaypoints : apiWaypoints;

  const finalNodes = useMemo(() => toNodes(finalWaypoints), [finalWaypoints]);
  const finalLinks = useMemo(() => seqLinks(finalNodes), [finalNodes]);

  const dateText = useMemo(() => {
    const d = startedAt ? new Date(startedAt) : new Date();
    const dayNames = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];
    const yy = d.getFullYear();
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    const day = dayNames[d.getDay()];
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yy}.${mm}.${dd} ${day} - ${hh}:${mi}`;
  }, [startedAt]);

  // 즐겨찾기 토글 상태(컨트롤드+낙관적)
  const [favChecked, setFavChecked] = useState<boolean>(!!isFavorite);
  const [favId, setFavId] = useState<number | null>(favoriteIdProp ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFavChecked(!!isFavorite);
  }, [isFavorite]);
  useEffect(() => {
    setFavId(favoriteIdProp ?? null);
  }, [favoriteIdProp]);

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  const handleFavoriteChange = async (next: boolean) => {
    // 부모 위임 시 바로 전달
    if (onToggleFavorite) {
      onToggleFavorite(next);
      return;
    }

    // 내부에서 API 호출
    if (saving) return;
    setSaving(true);

    // 낙관적 업데이트
    const prevChecked = favChecked;
    setFavChecked(next);

    try {
      if (next) {
        // CREATE
        if (!userId || !finalWaypoints || finalWaypoints.length < 2) {
          throw new Error(
            '즐겨찾기 생성에 필요한 정보가 부족합니다. (userId/waypoints)',
          );
        }
        const payload = {
          userId,
          name: routeName,
          waypoints: finalWaypoints,
          savedPolyline: '',
          distanceM: Math.round((routeDistanceKm ?? 0) * 1000),
          durationS: parseDurationToSeconds(finalDuration), // durationText를 finalDuration으로 변경
          safetyScore: safetyScore ?? 0,
          safetyLevel: planToSafetyLevel(plan),
          tags: [plan],
        };
        const { data } = await api.post('/api/favorites', payload);
        const newId: number | undefined =
          data?.data?.id ?? data?.id ?? data?.favoriteId;
        if (!newId) throw new Error('즐겨찾기 ID를 받지 못했습니다.');
        setFavId(newId);
      } else {
        // DELETE
        if (!userId || !favId) {
          throw new Error('삭제할 즐겨찾기 ID 또는 userId가 없습니다.');
        }
        await api.delete(`/api/favorites/${favId}`, { params: { userId } });
        setFavId(null);
      }
    } catch (e: any) {
      console.error('즐겨찾기 처리 실패:', e);
      // 롤백
      setFavChecked(prevChecked);
      alert(e?.message ?? '즐겨찾기 처리에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-4 py-3">
        <button
          aria-label="뒤로"
          className="grid h-9 w-9 place-items-center rounded-full"
          onClick={handleBack}
        >
          <IcSvgLeftArrow2 width={7} />
        </button>
        <div className="flex-1 pr-9 text-center">
          <h1 className="text-[17px] font-semibold text-black">러닝 완료</h1>
        </div>
      </div>

      {/* 상단 정보 */}
      <div className="px-5 pb-6 pt-4">
        <div className="text-[14px] text-gray-500">{dateText}</div>

        <div className="mt-4">
          <div className="text-[16px] font-semibold text-gray-500">총 거리</div>
          <div className="mt-1 text-[50px] font-extrabold leading-none tabular-nums text-black">
            {finalKm.toFixed(2)}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="text-[16px] font-semibold text-gray-500">
              평균 페이스
            </div>
            <div className="mt-2 text-[30px] font-extrabold leading-none tabular-nums text-black">
              {finalPace}
            </div>
          </div>
          <div>
            <div className="text-[16px] font-semibold text-gray-500">시간</div>
            <div className="mt-2 text-[30px] font-extrabold leading-none tabular-nums text-black">
              {finalDuration}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-200 relative">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-white/70">
            <p>최근 경로를 불러오는 중입니다...</p>
          </div>
        )}
        <RouteFromLinks
          nodes={finalNodes}
          links={finalLinks}
          showStartPin={true}
          showEndPin={true}
        />
      </div>

      {/* 하단 카드 (모바일 풀폭, PC 중앙정렬) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto w-full max-w-none px-0 pb-[env(safe-area-inset-bottom)] md:max-w-[560px] md:px-4">
          <div className="pointer-events-auto w-full rounded-t-[28px] bg-white p-5 shadow-[0_-12px_24px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold text-black"
                  style={{ background: PLAN_TAG_BG[plan] }}
                >
                  {PLAN_LABEL[plan]}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="truncate text-[20px] font-semibold text-black">
                    {routeName}
                  </div>
                  <div className="text-[18px] font-medium text-gray-500">
                    {routeDistanceKm}km
                  </div>
                </div>
              </div>

              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F3EEFF]">
                <FavoriteIcon
                  checked={favChecked}
                  onChange={handleFavoriteChange}
                  disabled={saving}
                  aria-label={favChecked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
