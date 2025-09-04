// src/components/RouteFromLinks.tsx
import { Map as KakaoMap, Polyline, MapMarker } from 'react-kakao-maps-sdk';
import { useEffect } from 'react';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = { id: string; from: string; to: string; geometry?: LatLng[] };

export default function RouteFromLinks({
  nodes,
  links,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
}) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const polylines: LatLng[][] = links
    .map((l) =>
      l.geometry && l.geometry.length >= 2
        ? l.geometry
        : nodeMap.has(l.from) && nodeMap.has(l.to)
          ? [
              { lat: nodeMap.get(l.from)!.lat, lng: nodeMap.get(l.from)!.lng },
              { lat: nodeMap.get(l.to)!.lat, lng: nodeMap.get(l.to)!.lng },
            ]
          : [],
    )
    .filter((a) => a.length >= 2);

  useEffect(() => {
    const el = document.getElementById('route-map') as any;
    const kakao = (window as any).kakao;
    if (!el?._kakaoMap || !kakao) return;
    const bounds = new kakao.maps.LatLngBounds();
    polylines.forEach((line) =>
      line.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))),
    );
    if (!bounds.isEmpty()) el._kakaoMap.setBounds(bounds);
  }, [polylines]);

  const start = polylines[0]?.[0];
  const end = polylines.at(-1)?.at(-1);

  return (
    <div
      id="route-map"
      style={{ width: '100%', height: 520 }}
    >
      <KakaoMap
        center={start ?? { lat: 37.5665, lng: 126.978 }}
        level={6}
        style={{ width: '100%', height: '100%' }}
        onCreate={(map) => {
          (document.getElementById('route-map') as any)._kakaoMap = map;
        }}
      >
        {start && (
          <MapMarker
            position={start}
            title="출발"
          />
        )}
        {end && (
          <MapMarker
            position={end}
            title="도착"
          />
        )}
        {polylines.map((line, i) => (
          <Polyline
            key={i}
            path={line}
            strokeWeight={5}
            strokeColor="#3478f6"
            strokeOpacity={0.95}
          />
        ))}
      </KakaoMap>
    </div>
  );
}
