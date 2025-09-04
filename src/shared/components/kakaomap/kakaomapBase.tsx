// src/components/KakaoMapBasic.tsx
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect, useState } from 'react';

type LatLng = { lat: number; lng: number };

export default function KakaoMapBasic() {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const [me, setMe] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.978 }); // 초기: 서울
  const [_, setReady] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMe(c);
        setCenter(c);
      },
      () => setMe(null),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  const handleCreate = () => setReady(true);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        center={center}
        isPanto
        level={5}
        style={{ width: '100%', height: '100%' }}
        onCreate={handleCreate}
        // 드래그/휠 허용
        draggable
        scrollwheel
      >
        {me && (
          <MapMarker
            position={me}
            title="내 위치"
          />
        )}
      </Map>
    </div>
  );
}
