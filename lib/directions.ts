/**
 * Yol tarifi bağlantıları. Ayrı dosyada, çünkü davet sayfası (tarayıcı) da kullanıyor;
 * arama kodu ve API anahtarı okuması tarayıcıya gitmesin.
 */

const tamam = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

export interface PlaceRef {
  venue: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  placeId?: string;
}

/**
 * Davetlinin telefonundaki harita uygulamalarına giden bağlantılar. Hepsi "bulunduğum
 * yerden arabayla" tarif açar. Koordinat yoksa yer adıyla aranır.
 */
export function directionLinks(p: PlaceRef) {
  const hasC = p.lat != null && p.lng != null && tamam(p.lat, p.lng);
  const q = [p.venue, p.address].filter(Boolean).join(", ");
  const ll = hasC ? `${p.lat},${p.lng}` : "";
  const google = new URL("https://www.google.com/maps/dir/");
  google.searchParams.set("api", "1");
  google.searchParams.set("destination", hasC ? ll : q);
  if (p.placeId) google.searchParams.set("destination_place_id", p.placeId);
  google.searchParams.set("travelmode", "driving");
  return {
    google: google.href,
    yandex: hasC
      ? `https://yandex.com.tr/harita/?rtext=~${ll}&rtt=auto`
      : `https://yandex.com.tr/harita/?text=${encodeURIComponent(q)}`,
    apple: hasC
      ? `https://maps.apple.com/?daddr=${ll}&q=${encodeURIComponent(p.venue)}&dirflg=d`
      : `https://maps.apple.com/?daddr=${encodeURIComponent(q)}&dirflg=d`,
    waze: hasC
      ? `https://waze.com/ul?ll=${ll}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(q)}&navigate=yes`,
    /** Şehir dışından gelenler için yakındaki oteller */
    hotels: hasC ? `https://www.google.com/maps/search/otel/@${ll},14z` : "",
    hasCoords: hasC,
  };
}

