import { useEffect, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보를 지원하지 않아요.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { coords, error };
}
