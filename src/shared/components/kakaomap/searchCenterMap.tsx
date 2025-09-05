// src/shared/components/kakaomap/searchCenterMap.tsx
import {
  Map,
  Circle,
  CustomOverlayMap,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { useEffect, useRef, useState } from 'react';
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
};

export default function SearchCenterMap({
  fillParent = false,
  showSearch = true,
  nearbyRadius = 12000,
}: Props) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.978 });
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [isKakaoReady, setIsKakaoReady] = useState(false);

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
        setAccuracy(
          typeof coords.accuracy === 'number' ? coords.accuracy : null,
        );

        if (mapRef.current) {
          mapRef.current.setCenter(new kakao.maps.LatLng(here.lat, here.lng));
        }
      },
      () => setPlaceholder('위치 권한이 필요해요'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (!marker || !isKakaoReady) return;
      const addr = await reverseGeocode(marker.lat, marker.lng);
      setPlaceholder(addr ?? '현재 위치를 불러올 수 없어요');
    })();
  }, [marker, isKakaoReady]);

  async function onSearch() {
    const term = q.trim();
    if (!term) return;

    if (isKakaoReady) {
      let hits = await keywordSearch(term, {
        location: center,
        radius: nearbyRadius,
      });
      if (!hits || hits.length === 0) hits = await keywordSearch(term);
      if (hits && hits.length > 0) {
        const top = hits[0];
        const next = { lat: top.lat, lng: top.lng };
        setCenter(next);
        setMarker(next);
        setAccuracy(null);
        setPlaceholder(top.name);
        return;
      }
    }

    const byAddr = await geocodeAddress(term);
    if (byAddr) {
      setCenter(byAddr);
      setMarker(byAddr);
      setAccuracy(null);
      if (isKakaoReady) {
        const addr = await reverseGeocode(byAddr.lat, byAddr.lng);
        if (addr) setPlaceholder(addr);
      }
      return;
    }

    alert('결과를 찾을 수 없어요. (장소명/주소를 확인해 주세요)');
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapRef.current && marker) {
        mapRef.current.relayout();
        mapRef.current.setCenter(new kakao.maps.LatLng(marker.lat, marker.lng));
      }
    });
    ro.observe(containerRef.current);

    const onWinResize = () => {
      if (mapRef.current && marker) {
        mapRef.current.relayout();
        mapRef.current.setCenter(new kakao.maps.LatLng(marker.lat, marker.lng));
      }
    };
    window.addEventListener('resize', onWinResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [marker]);

  const radius =
    accuracy != null ? Math.min(Math.max(accuracy, 10), 120) : null;

  return (
    <div
      ref={containerRef}
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
        onCreate={(map) => {
          mapRef.current = map;
          setIsKakaoReady(true);
        }}
      >
        {marker && (
          <>
            {radius && radius > 0 && (
              <Circle
                center={marker}
                radius={radius}
                strokeWeight={1}
                strokeColor="#6C55CF"
                strokeOpacity={0.45}
                strokeStyle="solid"
                fillColor="#6C55CF"
                fillOpacity={0.2}
                zIndex={9998}
              />
            )}

            <CustomOverlayMap
              position={marker}
              xAnchor={0.5}
              yAnchor={0.5}
              zIndex={9999}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#1E075D',
                  border: '4px solid white',
                  boxShadow: '0 0 6px rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                }}
              />
            </CustomOverlayMap>
          </>
        )}
      </Map>
    </div>
  );
}
