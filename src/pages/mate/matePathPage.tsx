import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import KakaoMapBasic from '../../shared/components/kakaomap/kakaomapBase';
import MateRouteSheet from './components/mateRouteSheet';
import api from '../../shared/apis/api';

// HH:mm → 오늘 날짜 ISO 문자열
function toTodayIso(hh: number, mm: number) {
  const now = new Date();
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh,
    mm,
    0,
    0,
  );
  return d.toISOString();
}

// 한글 → 서버 enum
function mapSafetyToServer(level: string) {
  const v = String(level ?? '').trim();
  if (v === '안전') return 'SAFE';
  if (v === '최단') return 'FAST';
  return 'NORMAL';
}

export default function MatePathPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 즐겨찾기에서 넘겨준 값만 사용(없으면 기본 폴백)
  const { safeLabel, placeName, distanceText, showMateSheet } = useMemo(() => {
    const s = (location.state ?? {}) as any;
    return {
      safeLabel: s.safeLabel ?? '보통',
      placeName: s.placeName ?? '경북대학교 정문',
      distanceText: s.distanceText ?? '5km',
      showMateSheet: !!s.showMateSheet,
    };
  }, [location.state]);

  const [sheetOpen, setSheetOpen] = useState(false);

  // 입력 상태(필요 시 외부 인풋으로 대체 가능)
  const [mm, setMm] = useState(''); // pace 분
  const [ss, setSs] = useState(''); // pace 초
  const [hh, setHh] = useState(''); // 시작 시
  const [startMm, setStartMm] = useState(''); // 시작 분
  const [participants, setParticipants] = useState(''); // 모집 인원

  useEffect(() => {
    if (showMateSheet) {
      setSheetOpen(true);
      // state 1회성 제거
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // 등록하기 → api.post → createdId/createdCrew 함께 넘겨서 MatePage가 즉시 렌더할 수 있게
  async function handleCreate(data: {
    targetPace: { mm: string | number; ss: string | number };
    startTime: { hh: string | number; mm: string | number };
    participants: number;
    hashtags?: string[];
  }) {
    try {
      const tags = Array.from(
        new Set(
          (data.hashtags ?? []).map((t) => String(t).trim()).filter(Boolean),
        ),
      );

      const payload = {
        title: placeName, // 출발지점
        description: distanceText, // 거리 그대로
        status: 'OPEN',
        maxParticipants: Number(data.participants || participants || 0),
        routeId: 'manual',
        type: 'RUN',
        distanceKmValue: Number(
          parseFloat((distanceText || '0').replace('km', '').trim()) || 0,
        ),
        safetyScore: 0,
        safetyLevel: mapSafetyToServer(safeLabel), // '안전' → 'SAFE' 등
        durationMin: 0,
        waypoints: [] as string[],
        tags,
        startLocation: placeName,
        pace: `${String(data.targetPace.mm ?? mm ?? 0).padStart(2, '0')}:${String(
          data.targetPace.ss ?? ss ?? 0,
        ).padStart(2, '0')}`,
        startTime: toTodayIso(
          Number(data.startTime.hh || hh || 0),
          Number(data.startTime.mm || startMm || 0),
        ),
      };

      const res = await api.post('/api/test/crews', payload);
      console.log('✅ 등록 성공 raw:', res.data);

      // 응답에서 생성된 객체/ID 최대한 탄탄하게 뽑기
      const created =
        res.data?.data?.crew ??
        res.data?.data ??
        res.data?.crew ??
        res.data ??
        null;

      const createdId =
        created?.id ??
        res.data?.id ??
        res.data?.crew?.id ??
        res.data?.data?.id ??
        null;

      // created 가 비어도, 화면 반영용으로 최소 객체는 만들어서 넘김(낙관적 렌더)
      const createdCrew = {
        id: createdId ?? Date.now(),
        startLocation: payload.startLocation,
        distanceKmValue: payload.distanceKmValue,
        safetyLevel: payload.safetyLevel,
        durationMin: payload.durationMin,
        pace: payload.pace,
        startTime: payload.startTime,
        tags: payload.tags,
        maxParticipants: payload.maxParticipants,
        currentParticipants: 0,
      };

      navigate('/mate', { state: { createdId, createdCrew } });
    } catch (err) {
      console.error('❌ 등록 실패:', err);
      alert('등록에 실패했어요. 다시 시도해 주세요.');
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-4 pt-[12px] pb-4 bg-white">
        <button
          aria-label="뒤로"
          className="grid h-9 w-9 place-items-center rounded-full"
          onClick={() => window.history.back()}
        >
          <IcSvgLeftArrow2 width={7} />
        </button>
        <div className="text-center">
          <h1 className="text-med18 pl-[5.5rem]">메이트 모집하기</h1>
        </div>
      </div>

      {/* 경로 버튼 */}
      <div>
        <p className="px-7 text-[18px] font-semibold">경로</p>
        <div className="w-full flex justify-center pt-2 pb-3 px-7">
          <button
            className="w-full py-1.5 bg-main2 text-white items-center font-semibold text-[14px] rounded-[8px]"
            onClick={() => navigate('/', { state: { hideBottom: true } })}
          >
            경로 찾기
          </button>
        </div>
      </div>

      {/* 지도 */}
      <div className="w-full h-[calc(100dvh-56px)]">
        <KakaoMapBasic />
      </div>

      {/* 시트: 열렸을 때만 렌더 */}
      {sheetOpen && (
        <MateRouteSheet
          safe={safeLabel}
          place={placeName}
          distance={distanceText}
          targetPace={{ mm: Number(mm) || 0, ss: Number(ss) || 0 }}
          startTime={{ hh: Number(hh) || 0, mm: Number(startMm) || 0 }}
          participants={Number(participants) || 0}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
