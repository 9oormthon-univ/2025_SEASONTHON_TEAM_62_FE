// src/components/KakaoMapBasic.tsx
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useEffect, useState } from 'react';

type LatLng = { lat: number; lng: number };

export default function KakaoMapBasic() {
  const [me, setMe] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMe(null),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  return (
    <div style={{ width: '100%', height: 520 }}>
      <Map
        center={me ?? { lat: 37.5665, lng: 126.978 }} // 내 위치 or 서울
        level={5}
        style={{ width: '100%', height: '100%' }}
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
