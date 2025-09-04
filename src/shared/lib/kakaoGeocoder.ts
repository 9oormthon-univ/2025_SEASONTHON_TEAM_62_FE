export type LatLng = { lat: number; lng: number };

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const kakao = (window as any).kakao;
  if (!kakao?.maps?.services) return null;
  const geocoder = new kakao.maps.services.Geocoder();
  return new Promise((resolve) => {
    geocoder.addressSearch(address, (result: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
      } else resolve(null);
    });
  });
}
