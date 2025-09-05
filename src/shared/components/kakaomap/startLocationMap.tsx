// src/shared/components/kakaomap/StartLocationMap.tsx
import SearcjStart from './searchStart';

type LatLng = { lat: number; lng: number };

export default function StartLocationMap({
  startLocation,
  height = 160,
}: {
  startLocation: string | LatLng;
  height?: number;
}) {
  return (
    <SearcjStart
      fillParent={false}
      showSearch={false} // 🔇 검색바 숨김
      heightPx={height}
      initialQuery={startLocation} // ⭐ 초기에 이걸로 중심 맞춤
    />
  );
}
