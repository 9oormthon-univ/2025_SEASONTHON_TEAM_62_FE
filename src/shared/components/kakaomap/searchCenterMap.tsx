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
  /** 부모 컨테이너를 가득 채울지 여부 (true면 width/height 100%) */
  fillParent?: boolean;
  /** 내부 검색 입력 표시 여부(페이지 상단에 별도 검색바가 있다면 false로) */
  showSearch?: boolean;
  /** 근처 검색 반경 (m). 기본 12km */
  nearbyRadius?: number;
};

export default function SearchCenterMap({
  fillParent = false,
  showSearch = true,
  nearbyRadius = 12000,
}: Props) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.978 }); // 초기: 서울
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [q, setQ] = useState('');
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  // Kakao SDK 준비 플래그 (useKakaoLoader가 붙인 스크립트가 services까지 준비되면 true)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (typeof window !== 'undefined' && window.kakao?.maps?.services) {
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
        // 역지오코딩은 SDK 준비 후 별도 effect에서 수행
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

  // 검색: 키워드(근처) → 키워드(전국) → 주소 지오코딩
  async function onSearch() {
    const term = q.trim();
    if (!term) return;

    // ① 키워드(장소명) - 내 주변 우선 시도
    if (isKakaoReady) {
      let hits = await keywordSearch(term, {
        location: center,
        radius: nearbyRadius,
      });

      // ② 근처에서 못 찾으면 전국 검색 재시도
      if (!hits || hits.length === 0) {
        hits = await keywordSearch(term);
      }

      if (hits && hits.length > 0) {
        const top = hits[0];
        const next = { lat: top.lat, lng: top.lng };
        setCenter(next);
        setMarker(next);
        setPlaceholder(top.name);
        // 필요 시 입력창 초기화: setQ('');
        return;
      }
    }

    // ③ 주소 지오코딩 폴백
    const byAddr = await geocodeAddress(term);
    if (byAddr) {
      setCenter(byAddr);
      setMarker(byAddr);
      if (isKakaoReady) {
        const addr = await reverseGeocode(byAddr.lat, byAddr.lng);
        if (addr) setPlaceholder(addr);
      }
      // 필요 시 입력창 초기화: setQ('');
      return;
    }

    alert('결과를 찾을 수 없어요. (장소명/주소를 확인해 주세요)');
  }

  return (
    <div
      style={{
        width: '100%',
        height: fillParent ? '100%' : 520,
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
            value={q} // ⚠️ 값이 비어 있어야 placeholder가 보입니다.
            placeholder={placeholder}
            onChange={(e) => setQ(e.target.value)}
            onSubmit={onSearch}
            // disabled={!isKakaoReady} // 필요하면 SDK 준비될 때까지 입력 비활성화
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
        onCreate={() => {
          // 맵이 만들어지면 services도 거의 준비되어 있음
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
