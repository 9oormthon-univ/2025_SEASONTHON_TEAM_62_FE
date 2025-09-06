// src/shared/components/kakaomap/searchCenterMap.tsx
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect, useRef, useState } from 'react';
import {
  geocodeAddress,
  reverseGeocode,
  keywordSearch,
} from '../../lib/kakaoGeocoder';
import Input from '../../components/input';

type LatLng = { lat: number; lng: number };
type SelectSource = 'search' | 'geo' | 'initial';

type Props = {
  fillParent?: boolean;
  showSearch?: boolean;
  nearbyRadius?: number;
  /** ⭐ 초기에 찾아서 가운데로 맞출 쿼리(장소명/주소 or 좌표) */
  initialQuery?: string | LatLng;
  /** 지도의 높이(px). fillParent=false일 때만 적용 */
  heightPx?: number;
  /** ⭐ 선택된 시작점을 상위로 알림(검색으로 확정된 경우에만 호출) */
  onSelectStart?: (p: { name: string; lat: number; lng: number }) => void;
  /** ⭐ 초기쿼리가 있으면 지오로케이션보다 우선할지 여부 */
  preferInitialOverGeo?: boolean;
};

export default function SearchStart({
  fillParent = false,
  showSearch = true,
  nearbyRadius = 12000,
  initialQuery,
  heightPx = 520,
  onSelectStart,
  preferInitialOverGeo = true,
}: Props) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.978 }); // 초기: 서울
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [q, setQ] = useState('');
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const initialAppliedRef = useRef(false); // 초기쿼리 한 번만 적용

  // Kakao SDK 준비 플래그(services 로딩 확인)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (
        typeof window !== 'undefined' &&
        (window as any).kakao?.maps?.services
      ) {
        setIsKakaoReady(true);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  // 공용: 선택 위치를 확정하고 (필요 시) 상위로 알림
  async function setStart(
    next: LatLng,
    name?: string,
    source: SelectSource = 'search',
  ) {
    setCenter(next);
    setMarker(next);

    let label: string | undefined = name;
    if (!label) {
      try {
        const addr = await reverseGeocode(next.lat, next.lng); // string | null
        if (addr !== null) label = addr; // ✅ null guard
      } catch {}
    }

    if (label) setPlaceholder(label);

    // ✅ 검색으로 확정된 경우에만 상위 콜백 호출
    if (source === 'search') {
      onSelectStart?.({
        name: label ?? '선택 위치',
        lat: next.lat,
        lng: next.lng,
      });
    }
  }

  // 현재 위치 획득 (초기쿼리가 있으면 스킵 가능) — 콜백 호출 안 함
  useEffect(() => {
    if (preferInitialOverGeo && initialQuery != null) return; // 초기쿼리 우선
    if (!('geolocation' in navigator)) {
      setPlaceholder('위치 서비스를 사용할 수 없어요');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude };
        await setStart(here, undefined, 'geo'); // ✅ geo: 콜백 X
      },
      () => setPlaceholder('위치 권한이 필요해요'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }, [preferInitialOverGeo, initialQuery]);

  // SDK + marker 준비되면 placeholder 보정(지오코딩 실패 대비) — 콜백 호출 안 함
  useEffect(() => {
    (async () => {
      if (!marker || !isKakaoReady) return;
      const addr = await reverseGeocode(marker.lat, marker.lng);
      if (addr) setPlaceholder(addr);
    })();
  }, [marker, isKakaoReady]);

  // 🔎 공용 검색 함수
  async function resolveQueryToLatLng(term: string, origin: LatLng) {
    try {
      let hits = await keywordSearch(term, {
        location: origin,
        radius: nearbyRadius,
      });
      if (!hits || hits.length === 0) hits = await keywordSearch(term); // 전국 검색
      if (hits && hits.length > 0) {
        const top = hits[0];
        return {
          lat: top.lat,
          lng: top.lng,
          name: top.name as string | undefined,
        };
      }
      const byAddr = await geocodeAddress(term);
      if (byAddr) return { ...byAddr, name: undefined };
    } catch {
      // 무시하고 null 리턴
    }
    return null;
  }

  // ⭐ 초기 쿼리 처리: SDK 준비되면 1회만 실행 — 콜백 호출 안 함
  useEffect(() => {
    (async () => {
      if (!isKakaoReady || initialQuery == null || initialAppliedRef.current)
        return;
      initialAppliedRef.current = true;

      // 좌표면 바로 세팅
      if (typeof initialQuery === 'object') {
        await setStart(initialQuery as LatLng, undefined, 'initial'); // ✅ initial: 콜백 X
        return;
      }

      // 문자열이면 검색으로 좌표 변환
      const term = String(initialQuery).trim();
      if (!term) return;
      const hit = await resolveQueryToLatLng(term, center);
      if (hit) {
        await setStart(
          { lat: hit.lat, lng: hit.lng },
          hit.name ?? term,
          'initial',
        ); // ✅ initial: 콜백 X
      }
    })();
  }, [isKakaoReady, initialQuery, center]);

  // 🔍 버튼/엔터로 직접 검색할 때 — 이때만 콜백 호출
  async function onSearch() {
    const term = q.trim();
    if (!term) return;

    const hit = await resolveQueryToLatLng(term, center);
    if (hit) {
      await setStart(
        { lat: hit.lat, lng: hit.lng },
        hit.name ?? term,
        'search',
      ); // ✅ search: 콜백 O
      // setQ('');
      return;
    }
    alert('결과를 찾을 수 없어요. (장소명/주소를 확인해 주세요)');
  }

  // 리사이즈 시 레이아웃/센터 보정(부드러운 팬)
  useEffect(() => {
    if (!mapRef.current || !marker) return;
    const ro = new ResizeObserver(() => {
      if (!mapRef.current || !marker) return;
      mapRef.current.relayout();
      mapRef.current.setCenter(new kakao.maps.LatLng(marker.lat, marker.lng));
    });
    const el = (mapRef.current as any).getNode?.() as HTMLElement | undefined;
    if (el) ro.observe(el);
    const onWinResize = () => {
      if (!mapRef.current || !marker) return;
      mapRef.current.relayout();
      mapRef.current.setCenter(new kakao.maps.LatLng(marker.lat, marker.lng));
    };
    window.addEventListener('resize', onWinResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [marker]);

  return (
    <div
      style={{
        width: '100%',
        height: fillParent ? '100%' : heightPx,
        position: 'relative',
      }}
    >
      {showSearch && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            margin: 12,
            zIndex: 10,
          }}
        >
          <Input
            value={q}
            placeholder={placeholder}
            onChange={(e) => setQ(e.target.value)}
            onSubmit={onSearch}
          />
        </div>
      )}

      <Map
        center={center}
        level={4}
        style={{ width: '100%', height: '100%' }}
        isPanto
        draggable
        scrollwheel
        onCreate={(m) => {
          mapRef.current = m as unknown as kakao.maps.Map;
          setIsKakaoReady(true);
        }}
      >
        {marker && (
          <MapMarker
            position={marker}
            title="선택 위치"
          />
        )}
      </Map>
    </div>
  );
}
