// src/components/InfoMap.tsx
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect, useMemo, useState } from 'react';

type LatLng = { lat: number; lng: number };

interface InfoMapProps {
  query: string | LatLng; // ✅ 문자열 또는 좌표
  height?: number;
}

export default function InfoMap({ query, height = 200 }: InfoMapProps) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const [center, setCenter] = useState<LatLng | null>(null);
  const [ready, setReady] = useState(false);
  const isCoord = useMemo(
    () => typeof query === 'object' && query !== null,
    [query],
  );

  // Map 생성 완료
  const handleCreate = () => setReady(true);

  // 1) 좌표면 그냥 바로 세팅
  useEffect(() => {
    if (isCoord) setCenter(query as LatLng);
  }, [isCoord, query]);

  // 2) 문자열이면 Places 검색
  useEffect(() => {
    if (isCoord) return;
    if (!ready) return;

    const kakao = (window as any).kakao;
    if (!kakao?.maps?.services) return;

    const text = String(query ?? '').trim();
    if (!text) return;

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(text, (data: any[], status: string) => {
      const S = kakao.maps.services.Status;
      if (status === S.OK && data.length) {
        const first = data[0];
        setCenter({ lat: parseFloat(first.y), lng: parseFloat(first.x) });
      } else if (status === S.ZERO_RESULT) {
        console.warn('[KakaoMap] 결과 없음:', text);
        setCenter(null);
      } else {
        console.error('[KakaoMap] 검색 실패:', status);
        setCenter(null);
      }
    });
  }, [isCoord, query, ready]);

  if (!center) {
    return (
      <div
        className="w-full bg-gray-100 flex items-center justify-center text-sm text-gray-500"
        style={{ height }}
      >
        지도 불러오는 중…
      </div>
    );
  }

  return (
    <Map
      center={center}
      style={{ width: '100%', height }}
      level={4}
      isPanto
      onCreate={handleCreate}
    >
      <MapMarker
        position={center}
        title={typeof query === 'string' ? query : 'start location'}
      />
    </Map>
  );
}
