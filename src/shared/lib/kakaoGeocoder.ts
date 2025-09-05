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
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const kakao = (window as any).kakao;
  if (!kakao?.maps?.services) return null;

  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve) => {
    // Kakao API는 (lng, lat) 순서!
    geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        const addr =
          result[0].road_address?.address_name ??
          result[0].address?.address_name ??
          null;
        resolve(addr);
      } else {
        resolve(null);
      }
    });
  });
}
export async function keywordSearch(
  query: string,
  opts?: { location?: { lat: number; lng: number }; radius?: number }, // 반경(m)
): Promise<{ lat: number; lng: number; name: string }[] | null> {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) return resolve(null);
    const ps = new window.kakao.maps.services.Places();

    const options: kakao.maps.services.PlacesSearchOptions = {};
    if (opts?.location) {
      options.location = new window.kakao.maps.LatLng(
        opts.location.lat,
        opts.location.lng,
      );
      if (opts.radius) options.radius = opts.radius; // 기본 5000m
    }

    ps.keywordSearch(
      query,
      (data, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !data?.length) {
          return resolve(null);
        }
        const hits = data.map((d) => ({
          lat: Number(d.y),
          lng: Number(d.x),
          name: d.place_name,
        }));
        resolve(hits);
      },
      options,
    );
  });
}
