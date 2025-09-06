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
  initialQuery?: string | LatLng;
  heightPx?: number;
  onSelectStart?: (p: { name: string; lat: number; lng: number }) => void;
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

  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.978 });
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [q, setQ] = useState('');
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const initialAppliedRef = useRef(false);

  // ===== iOS CoreLocation Unknown 대응용 상태 =====
  const geoRetryRef = useRef(0);
  const geoWatchIdRef = useRef<number | null>(null);
  const geoAbortedRef = useRef(false);
  // ============================================

  // 🔒 보안 컨텍스트 체크
  const isSecure =
    typeof window !== 'undefined' &&
    (window.isSecureContext ||
      ['localhost', '127.0.0.1'].includes(location.hostname));

  useEffect(() => {
    if (!isSecure) setPlaceholder('HTTPS에서만 위치를 가져올 수 있어요');
  }, [isSecure]);

  // Kakao SDK 준비 플래그(services 로딩 확인)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if ((window as any).kakao?.maps?.services) setIsKakaoReady(true);
      else raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  // ✅ StrictMode 대응: 마운트마다 aborted 리셋
  useEffect(() => {
    geoAbortedRef.current = false; // ⬅️ 여기 추가(핵심)
    return () => {
      geoAbortedRef.current = true;
      if (geoWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    };
  }, []);

  // 공용: 선택 위치 세팅(+ 필요 시 상위 알림)
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
        const addr = await reverseGeocode(next.lat, next.lng);
        if (addr !== null) label = addr;
      } catch {}
    }
    if (label) setPlaceholder(label);

    if (source === 'search') {
      onSelectStart?.({
        name: label ?? '선택 위치',
        lat: next.lat,
        lng: next.lng,
      });
    }
  }

  // 지오로케이션(재시도 + watch 1회 폴백)
  async function requestGeoWithFallback() {
    if (!isSecure) {
      setPlaceholder('HTTPS에서만 위치를 가져올 수 있어요');
      return;
    }
    if (!('geolocation' in navigator)) {
      setPlaceholder('위치 서비스를 사용할 수 없어요');
      return;
    }

    const tryGet = (opts: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, opts);
      });
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const attempts: PositionOptions[] = [
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 1000 },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60_000 },
    ];

    for (let i = 0; i < attempts.length; i++) {
      if (geoAbortedRef.current) return;
      geoRetryRef.current = i + 1;
      try {
        if (i > 0) {
          setPlaceholder(
            `위치 신호가 약해요… 재시도 중 (${i + 1}/${attempts.length})`,
          );
          await sleep(600);
        }
        const pos = await tryGet(attempts[i]);
        if (geoAbortedRef.current) return;
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        await setStart(here, undefined, 'geo');
        return;
      } catch (err: any) {
        const code = Number(err?.code ?? -1);
        const isRecoverable = code === 2 || code === 3; // UNAVAILABLE/TIMEOUT
        if (!isRecoverable || i === attempts.length - 1) break;
      }
    }

    setPlaceholder('위치 가져오는 중… (대기)');
    if (geoWatchIdRef.current != null)
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        if (geoAbortedRef.current) return;
        if (geoWatchIdRef.current != null) {
          navigator.geolocation.clearWatch(geoWatchIdRef.current);
          geoWatchIdRef.current = null;
        }
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        await setStart(here, undefined, 'geo');
      },
      () => {
        if (geoWatchIdRef.current != null) {
          navigator.geolocation.clearWatch(geoWatchIdRef.current);
          geoWatchIdRef.current = null;
        }
        setPlaceholder('현재 위치를 불러올 수 없어요');
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300_000 },
    );

    setTimeout(() => {
      if (geoWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
        setPlaceholder('현재 위치를 불러올 수 없어요');
      }
    }, 15000);
  }

  // ✅ 현재 위치 시도(유효한 initialQuery 있을 때만 스킵)
  useEffect(() => {
    const hasValidInitial =
      typeof initialQuery === 'object' ||
      (typeof initialQuery === 'string' && initialQuery.trim().length > 0);

    if (preferInitialOverGeo && hasValidInitial) return;
    requestGeoWithFallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferInitialOverGeo, initialQuery]);

  // SDK + marker 준비되면 placeholder 보정
  useEffect(() => {
    (async () => {
      if (!marker || !isKakaoReady) return;
      const addr = await reverseGeocode(marker.lat, marker.lng);
      if (addr) setPlaceholder(addr);
    })();
  }, [marker, isKakaoReady]);

  // 🔎 공용 검색
  async function resolveQueryToLatLng(term: string, origin: LatLng) {
    try {
      let hits = await keywordSearch(term, {
        location: origin,
        radius: nearbyRadius,
      });
      if (!hits || hits.length === 0) hits = await keywordSearch(term);
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
    } catch {}
    return null;
  }

  // ⭐ 초기 쿼리 1회 처리
  useEffect(() => {
    (async () => {
      if (!isKakaoReady || initialQuery == null || initialAppliedRef.current)
        return;
      initialAppliedRef.current = true;

      if (typeof initialQuery === 'object') {
        await setStart(initialQuery as LatLng, undefined, 'initial');
        return;
      }

      const term = String(initialQuery).trim();
      if (!term) {
        requestGeoWithFallback();
        return;
      }
      const hit = await resolveQueryToLatLng(term, center);
      if (hit) {
        await setStart(
          { lat: hit.lat, lng: hit.lng },
          hit.name ?? term,
          'initial',
        );
      } else {
        requestGeoWithFallback();
      }
    })();
  }, [isKakaoReady, initialQuery, center]);

  // 🔍 직접 검색
  async function onSearch() {
    const term = q.trim();
    if (!term) return;
    const hit = await resolveQueryToLatLng(term, center);
    if (hit) {
      await setStart(
        { lat: hit.lat, lng: hit.lng },
        hit.name ?? term,
        'search',
      );
      return;
    }
    alert('결과를 찾을 수 없어요. (장소명/주소를 확인해 주세요)');
  }

  // 리사이즈 시 보정
  useEffect(() => {
    if (!mapRef.current || !marker) return;
    const ro = new ResizeObserver(() => {
      if (!mapRef.current || !marker) return;
      (mapRef.current as any).relayout?.();
      mapRef.current.setCenter(new kakao.maps.LatLng(marker.lat, marker.lng));
    });
    const el = (mapRef.current as any).getNode?.() as HTMLElement | undefined;
    if (el) ro.observe(el);
    const onWinResize = () => {
      if (!mapRef.current || !marker) return;
      (mapRef.current as any).relayout?.();
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
