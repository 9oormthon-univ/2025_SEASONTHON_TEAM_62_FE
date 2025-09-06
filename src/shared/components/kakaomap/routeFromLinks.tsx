import {
  Map as KakaoMap,
  Polyline,
  useKakaoLoader,
  CustomOverlayMap,
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
  currentPosition?: LatLng | null;
  followUser?: boolean; // 재생 중엔 true로 넘김
};

type Segment = { path: LatLng[]; color?: string };

function CurrentLocationMarker({ position }: { position: LatLng }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        backgroundColor: '#007AFF',
        border: '3px solid #FFFFFF',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 40,
          height: 40,
          backgroundColor: '#007AFF',
          borderRadius: '50%',
          opacity: 0.3,
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 2s infinite',
        }}
      />
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%,-50%) scale(.5); opacity:.3 }
          50% { transform: translate(-50%,-50%) scale(1); opacity:.1 }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity:0 }
        }
      `}</style>
    </div>
  );
}

export default function RouteFromLinks({
  nodes,
  links = [],
  showStartPin = true,
  showEndPin = true,
  currentPosition = null,
  followUser = false,
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

  const start: LatLng | undefined = useMemo(() => {
    const s = nodes.find((n) => n.id === 'start') ?? nodes[0];
    return s ? { lat: s.lat, lng: s.lng } : segments[0]?.path[0];
  }, [nodes, segments]);

  const end: LatLng | undefined = useMemo(() => {
    if (!showEndPin) return undefined;
    const e = nodes.find((n) => n.id === 'end');
    return e ? { lat: e.lat, lng: e.lng } : segments.at(-1)?.path.at(-1);
  }, [showEndPin, nodes, segments]);

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const didInitialFitRef = useRef(false);

  const fitToRouteOnce = useCallback(() => {
    const kakao = (window as any).kakao;
    const map = mapRef.current;
    if (!kakao || !map || didInitialFitRef.current) return;

    if (segments.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      segments.forEach((seg) =>
        seg.path.forEach((p) =>
          bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)),
        ),
      );
      if (!bounds.isEmpty()) {
        map.setBounds(bounds); // 🔍 초기 한 번만 줌/센터 맞춤
        didInitialFitRef.current = true;
      }
    } else if (start) {
      map.setCenter(new kakao.maps.LatLng(start.lat, start.lng));
      didInitialFitRef.current = true;
    }
  }, [segments, start]);

  const panToUser = useCallback(() => {
    const kakao = (window as any).kakao;
    const map = mapRef.current;
    if (!kakao || !map || !currentPosition) return;
    // ✅ 줌은 건드리지 않고 부드럽게 중심만 이동
    (map as any).panTo(
      new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng),
    );
  }, [currentPosition]);

  const handleCreate = (map: kakao.maps.Map) => {
    mapRef.current = map;
    fitToRouteOnce();
  };

  // 초기 경로 맞춤: 데이터가 바뀌고 아직 한 번도 fit 안했을 때만
  useEffect(() => {
    fitToRouteOnce();
  }, [fitToRouteOnce]);

  // 재생 중(followUser=true) + 위치 갱신되면 중심만 현재 위치로 이동(줌 불변)
  useEffect(() => {
    if (followUser && currentPosition) {
      panToUser();
    }
  }, [followUser, currentPosition, panToUser]);

  // 초기 center (level/zoom을 props로 주지 않음: 사용자 조작 보존)
  const mapCenter = useMemo(
    () => start ?? { lat: 37.5665, lng: 126.978 },
    [start],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <KakaoMap
        center={mapCenter}
        style={{ width: '100%', height: '100%' }}
        onCreate={handleCreate}
        isPanto
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

        {currentPosition && (
          <CustomOverlayMap
            position={currentPosition}
            yAnchor={0.5}
            xAnchor={0.5}
          >
            <CurrentLocationMarker position={currentPosition} />
          </CustomOverlayMap>
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
