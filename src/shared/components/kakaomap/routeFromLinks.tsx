import {
  Map as KakaoMap,
  Polyline,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { useEffect, useMemo, useRef } from 'react';
import LabelPin from './labelPin'; 

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = { id: string; from: string; to: string; geometry?: LatLng[] };

type Props = {
  nodes: GraphNode[];
  links?: GraphLink[]; 
  showEndPin?: boolean; 
};

export default function RouteFromLinks({
  nodes,
  links = [], 
  showEndPin = true,
}: Props) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const polylines: LatLng[][] = useMemo(
    () =>
      links
        .map((l) =>
          l.geometry?.length! >= 2
            ? (l.geometry as LatLng[])
            : nodeMap.has(l.from) && nodeMap.has(l.to)
              ? [
                  {
                    lat: nodeMap.get(l.from)!.lat,
                    lng: nodeMap.get(l.from)!.lng,
                  },
                  { lat: nodeMap.get(l.to)!.lat, lng: nodeMap.get(l.to)!.lng },
                ]
              : [],
        )
        .filter((a) => a.length >= 2),
    [links, nodeMap],
  );

  // 출발: nodes에서 'start' → 없으면 첫 노드 → 그래도 없으면 폴리라인 첫 점
  const start: LatLng | undefined = useMemo(() => {
    const s = nodes.find((n) => n.id === 'start') ?? nodes[0];
    return s ? { lat: s.lat, lng: s.lng } : polylines[0]?.[0];
  }, [nodes, polylines]);

  // 도착: showEndPin일 때만 계산 (nodes의 'end' → 폴리라인 마지막 점)
  const end: LatLng | undefined = useMemo(() => {
    if (!showEndPin) return undefined;
    const e = nodes.find((n) => n.id === 'end');
    return e ? { lat: e.lat, lng: e.lng } : polylines.at(-1)?.at(-1);
  }, [showEndPin, nodes, polylines]);

  const mapRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    const kakao = (window as any).kakao;
    const map = mapRef.current;
    if (!map || !kakao) return;

    if (polylines.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      polylines.forEach((line) =>
        line.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))),
      );
      if (!bounds.isEmpty()) map.setBounds(bounds);
    } else if (start) {
      map.setCenter(new kakao.maps.LatLng(start.lat, start.lng));
    }
  }, [polylines, start]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <KakaoMap
        center={start ?? { lat: 37.5665, lng: 126.978 }}
        level={6}
        style={{ width: '100%', height: '100%' }}
        onCreate={(map) => (mapRef.current = map)}
      >
        {start && (
          <LabelPin
            lat={start.lat}
            lng={start.lng}
            text="출발"
            bg="#6043AE"
          />
        )}

        {end && (
          <LabelPin
            lat={end.lat}
            lng={end.lng}
            text="도착"
            bg="#111827"
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
