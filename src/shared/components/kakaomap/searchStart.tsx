// src/shared/components/kakaomap/searchCenterMap.tsx
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect, useState } from 'react';
import {
  geocodeAddress,
  reverseGeocode,
  keywordSearch,
} from '../../lib/kakaoGeocoder';
import Input from '../../components/input';

type LatLng = { lat: number; lng: number };

type Props = {
  fillParent?: boolean;
  showSearch?: boolean;
  nearbyRadius?: number;
  /** ⭐ 초기에 찾아서 가운데로 맞출 쿼리(장소명/주소 or 좌표) */
  initialQuery?: string | LatLng;
  /** 지도의 높이(px). fillParent=false일 때만 적용 */
  heightPx?: number;
};

export default function SearchStart({
  fillParent = false,
  showSearch = true,
  nearbyRadius = 12000,
  initialQuery, // ⭐ 추가
  heightPx = 520, // ⭐ 추가
}: Props) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.978 }); // 초기: 서울
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [q, setQ] = useState('');
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  // Kakao SDK 준비 플래그
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

  // 현재 위치 획득
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPlaceholder('위치 서비스를 사용할 수 없어요');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude };
        setCenter(here);
        setMarker(here);
      },
      () => setPlaceholder('위치 권한이 필요해요'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }, []);

  // SDK + marker 준비되면 주소로 placeholder 업데이트
  useEffect(() => {
    (async () => {
      if (!marker || !isKakaoReady) return;
      const addr = await reverseGeocode(marker.lat, marker.lng);
      setPlaceholder(addr ?? '현재 위치를 불러올 수 없어요');
    })();
  }, [marker, isKakaoReady]);

  // 🔎 공용 검색 함수
  async function resolveQueryToLatLng(term: string, origin: LatLng) {
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
    return null;
  }

  // ⭐ 초기 쿼리 처리: SDK 준비되면 1회만 실행
  useEffect(() => {
    (async () => {
      if (!isKakaoReady || initialQuery == null) return;

      // 좌표면 바로 세팅
      if (typeof initialQuery === 'object') {
        setCenter(initialQuery);
        setMarker(initialQuery);
        const addr = await reverseGeocode(initialQuery.lat, initialQuery.lng);
        if (addr) setPlaceholder(addr);
        return;
      }

      // 문자열이면 검색으로 좌표 변환
      const term = String(initialQuery).trim();
      if (!term) return;
      const hit = await resolveQueryToLatLng(term, center);
      if (hit) {
        const next = { lat: hit.lat, lng: hit.lng };
        setCenter(next);
        setMarker(next);
        setPlaceholder(hit.name ?? term);
      }
    })();
    // 초기 1회: initialQuery가 바뀌면 다시 실행되도록 의존성 포함
  }, [isKakaoReady, initialQuery]);

  // 🔍 버튼/엔터로 직접 검색할 때
  async function onSearch() {
    const term = q.trim();
    if (!term) return;

    const hit = await resolveQueryToLatLng(term, center);
    if (hit) {
      const next = { lat: hit.lat, lng: hit.lng };
      setCenter(next);
      setMarker(next);
      setPlaceholder(hit.name ?? term);
      // setQ('');
      return;
    }
    alert('결과를 찾을 수 없어요. (장소명/주소를 확인해 주세요)');
  }

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
        onCreate={() => setIsKakaoReady(true)}
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
