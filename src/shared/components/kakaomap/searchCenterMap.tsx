// src/components/SearchCenterMap.tsx
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useState } from 'react';
import { geocodeAddress } from '../../lib/kakaoGeocoder';

export default function SearchCenterMap() {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [marker, setMarker] = useState<typeof center | null>(null);
  const [q, setQ] = useState('');

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const hit = await geocodeAddress(q);
    if (hit) {
      setCenter(hit);
      setMarker(hit);
    } else alert('주소를 찾을 수 없어요.');
  }

  return (
    <>
      <form
        onSubmit={onSearch}
        style={{ marginBottom: 12 }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="주소를 입력하세요"
        />
        <button type="submit">검색</button>
      </form>
      <div style={{ width: '100%', height: 520 }}>
        <Map
          center={center}
          level={4}
          style={{ width: '100%', height: '100%' }}
        >
          {marker && <MapMarker position={marker} />}
        </Map>
      </div>
    </>
  );
}
