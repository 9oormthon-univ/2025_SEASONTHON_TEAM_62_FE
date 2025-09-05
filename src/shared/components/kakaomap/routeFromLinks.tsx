import {
  Map as KakaoMap,
  Polyline,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import LabelPin from './labelPin';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = {
  id: string;
  from: string;
  to: string;
  geometry?: LatLng[];
  color?: string;
};

type Props = {
  nodes: GraphNode[];
  links?: GraphLink[];
  showStartPin?: boolean;
  showEndPin?: boolean;
};

type Segment = { path: LatLng[]; color?: string };

export default function RouteFromLinks({
  nodes,
  links = [],
  showStartPin = true,
  showEndPin = true,
}: Props) {
  const appkey = import.meta.env.VITE_KAKAOMAP_KEY as string;
  useKakaoLoader({ appkey, libraries: ['services'] });

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const segments: Segment[] = useMemo(() => {
    return links
      .map((l) => {
        const path =
          l.geometry && l.geometry.length >= 2
            ? l.geometry
            : nodeMap.has(l.from) && nodeMap.has(l.to)
              ? [
                  {
                    lat: nodeMap.get(l.from)!.lat,
                    lng: nodeMap.get(l.from)!.lng,
                  },
                  { lat: nodeMap.get(l.to)!.lat, lng: nodeMap.get(l.to)!.lng },
                ]
              : [];
        return { path, color: l.color };
      })
      .filter((seg) => seg.path.length >= 2);
  }, [links, nodeMap]);

  // 출발: nodes의 'start' → 없으면 첫 노드 → 그래도 없으면 세그먼트 첫 점
  const start: LatLng | undefined = useMemo(() => {
    const s = nodes.find((n) => n.id === 'start') ?? nodes[0];
    return s ? { lat: s.lat, lng: s.lng } : segments[0]?.path[0];
  }, [nodes, segments]);

  // 도착: showEndPin일 때만 (nodes의 'end' → 세그먼트 마지막 점)
  const end: LatLng | undefined = useMemo(() => {
    if (!showEndPin) return undefined;
    const e = nodes.find((n) => n.id === 'end');
    return e ? { lat: e.lat, lng: e.lng } : segments.at(-1)?.path.at(-1);
  }, [showEndPin, nodes, segments]);

  const mapRef = useRef<kakao.maps.Map | null>(null);

  const fitToRoute = useCallback(() => {
    const kakao = (window as any).kakao;
    const map = mapRef.current;
    if (!kakao || !map) return;

    if (segments.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      segments.forEach((seg) =>
        seg.path.forEach((p) =>
          bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)),
        ),
      );
      if (!bounds.isEmpty()) {
        map.setBounds(bounds);
      }
    } else if (start) {
      map.setCenter(new kakao.maps.LatLng(start.lat, start.lng));
      map.setLevel(4);
    }
  }, [segments, start]);

  const handleCreate = (map: kakao.maps.Map) => {
    mapRef.current = map;
    fitToRoute();
  };

  useEffect(() => {
    fitToRoute();
  }, [fitToRoute]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <KakaoMap
        center={start ?? { lat: 37.5665, lng: 126.978 }}
        level={6}
        style={{ width: '100%', height: '100%' }}
        onCreate={handleCreate}
      >
        {showStartPin && start && (
          <LabelPin
            lat={start.lat}
            lng={start.lng}
            text="출발"
            bg="#6043AE"
          />
        )}

        {showEndPin && end && (
          <LabelPin
            lat={end.lat}
            lng={end.lng}
            text="도착"
            bg="#111827"
          />
        )}

        {segments.map((seg, i) => (
          <Polyline
            key={i}
            path={seg.path}
            strokeWeight={6}
            strokeColor={seg.color ?? '#3478f6'}
            strokeOpacity={0.95}
            strokeStyle="solid"
          />
        ))}
      </KakaoMap>
    </div>
  );
}
