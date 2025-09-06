import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Post from '../../shared/components/post';
import InfoModal from './components/modal/infomodal';
import api from '../../shared/apis/api';
import Input from '../../shared/components/input';
import { reverseGeocode } from '../../shared/lib/kakaoGeocoder';
import MainDropDown from './components/tagWithDropdown/mainDropdown';
import FloatingActions from './components/FloatingButton';
import { formatTime } from '../../shared/lib/dateFormat';

function mapSafetyLevel(s: unknown): '안전' | '보통' | '최단' {
  const v = String(s ?? '')
    .toLowerCase()
    .trim();
  if (['safe', '안전', 'low', 'easy'].includes(v)) return '안전';
  if (['shortest', '최단', 'short', 'fast'].includes(v)) return '최단';
  return '보통';
}

export default function MatePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<any[]>([]);
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  // ✅ 낙관적 아이템을 유지하기 위한 ref (history state가 지워져도 남음)
  const optimisticRef = useRef<any | null>(null);
  // 서버에 등장했는지 체크할 id 저장(있으면 중복 방지 및 ref 해제에 사용)
  const createdIdRef = useRef<string | number | null>(null);
  // state를 ref로 옮겼는지 여부(중복 처리 방지)
  const stateDrainedRef = useRef(false);

  useEffect(() => {
    // 최초 1회: location.state → ref로 옮기고, 그 다음에만 replace로 비움
    if (!stateDrainedRef.current) {
      const st = (location.state ?? {}) as any;
      const createdId = st?.createdId ?? st?.createdCrew?.id ?? null;
      const createdCrew = st?.createdCrew ?? null;

      if (createdId) createdIdRef.current = createdId;
      if (createdCrew) optimisticRef.current = createdCrew;

      if (createdId || createdCrew) {
        // 이제부터는 ref가 보관하므로 state 비워도 사라지지 않음
        navigate(location.pathname, { replace: true, state: null });
      }
      stateDrainedRef.current = true;
    }

    async function setCurrentLocationPlaceholder() {
      if (!('geolocation' in navigator)) {
        setPlaceholder('위치 서비스를 사용할 수 없어요');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const addr = await reverseGeocode(coords.latitude, coords.longitude);
          setPlaceholder(addr ?? '현재 위치를 불러올 수 없어요');
        },
        () => setPlaceholder('위치 권한이 필요해요'),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    }

    async function loadCrews() {
      try {
        const res = await api.get('/api/test/crews');

        const crewsRaw =
          res.data?.data?.crews ??
          res.data?.crews ??
          res.data?.data ??
          res.data ??
          [];

        const crews = Array.isArray(crewsRaw) ? crewsRaw : [];

        const mapRow = (c: any) => {
          const distanceKm = Number(
            c.distanceKmValue ?? c.distanceKm ?? c.distance ?? 0,
          );
          return {
            ...c,
            startTime: formatTime(c.startTime),
            level: mapSafetyLevel(c.safetyLevel),
            distance: Number.isFinite(distanceKm) ? `${distanceKm}km` : '',
            distanceFromHere: String(c.durationMin ?? '0'),
            pace: String(c.pace ?? ''),
            tags: Array.isArray(c.tags) ? c.tags : [],
            currentParticipants: Number(c.currentParticipants ?? 0),
            maxParticipants: Number(c.maxParticipants ?? 0),
          };
        };

        let mapped = crews.map(mapRow);

        // ✅ 서버 응답에 방금 생성한 글이 있는지 확인
        const cid = createdIdRef.current;
        const existsOnServer =
          cid != null && mapped.some((r) => String(r.id) === String(cid));

        if (!existsOnServer && optimisticRef.current) {
          // 서버에 아직 없으면 낙관적 아이템을 맨 앞에 유지
          const existsInList = mapped.some(
            (r) => String(r.id) === String(optimisticRef.current.id),
          );
          if (!existsInList) {
            mapped.unshift(mapRow(optimisticRef.current));
          }
        } else if (existsOnServer) {
          // 서버에 등장했으면 낙관적 아이템 버림(이제 서버 데이터로만)
          optimisticRef.current = null;
        }

        setData(mapped);
      } catch (err) {
        console.error('❌ 요청 실패:', err);
        setData([]);
        // 실패 시에도 낙관적 아이템이 있으면 최소한 보여주기
        if (optimisticRef.current) {
          setData(
            [optimisticRef.current].map((c) => ({
              ...c,
              startTime: formatTime(c.startTime),
              level: mapSafetyLevel(c.safetyLevel),
              distance: `${Number(c.distanceKmValue ?? 0)}km`,
              distanceFromHere: String(c.durationMin ?? '0'),
              pace: String(c.pace ?? ''),
              tags: Array.isArray(c.tags) ? c.tags : [],
              currentParticipants: Number(c.currentParticipants ?? 0),
              maxParticipants: Number(c.maxParticipants ?? 0),
            })),
          );
        }
      }
    }

    setCurrentLocationPlaceholder();
    loadCrews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const handleOpen = (crew: any) => {
    setSelected(crew);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-1 justify-center pt-3">
      <Input
        value=""
        placeholder={placeholder}
        onChange={() => {}}
        onSubmit={() => {}}
      />
      <MainDropDown />

      <div className="flex flex-col px-4 gap-1">
        {data.length === 0 ? (
          <div className="text-gray-500">모집 중인 메이트가 없어요.</div>
        ) : (
          data.map((crew: any) => (
            <Post
              key={String(crew.id)}
              id={String(crew.id)}
              level={crew.level}
              title={crew.startLocation}
              distanceFromHere={String(crew.distanceFromHere)}
              distance={String(crew.distance)}
              pace={String(crew.pace)}
              startTime={String(crew.startTime)}
              tags={crew.tags || []}
              participants={Number(crew.currentParticipants ?? 0)}
              maxParticipants={Number(crew.maxParticipants ?? 0)}
              onClick={() => handleOpen(crew)}
            />
          ))
        )}
      </div>

      <FloatingActions />

      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative z-10 pointer-events-none flex items-center justify-center p-4 w-full h-full">
            <div className="pointer-events-auto relative">
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              >
                ✕
              </button>

              <InfoModal
                level={selected.level}
                place={selected.startLocation}
                placedetail={selected.placedetail ?? selected.address ?? ''}
                distance={String(selected.distance)}
                pace={String(selected.pace)}
                startTime={String(selected.startTime)}
                participants={Number(selected.currentParticipants ?? 0)}
                maxParticipants={Number(selected.maxParticipants ?? 0)}
                tags={selected.tags || []}
                startLocation={selected.startLocation}
                onJoin={() => {
                  console.log('join', selected.id);
                  handleClose();
                }}
              />
            </div>
          </div>
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
