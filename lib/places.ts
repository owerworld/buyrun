/**
 * Mekân arama ve yol tarifi.
 *
 * Kullanıcı "Podyum Davet" yazar, gerçek yeri listeden seçer; adres ve koordinat
 * kendiliğinden dolar. Davetli tek dokunuşla telefonundaki harita uygulamasında,
 * bulunduğu yerden arabayla yol tarifi alır.
 *
 * Sağlayıcılar, sırayla (biri sonuç vermezse ya da hata verirse sonrakine geçilir):
 *  - GOOGLE_MAPS_API_KEY varsa Google Places (Türkiye'de en geniş kapsam, kart ister)
 *  - TOMTOM_API_KEY varsa TomTom (günde 2.500 arama ücretsiz, kart istemez;
 *    kota dolunca ücret kesilmez, istek reddedilir)
 *  - her zaman OpenStreetMap / Photon (anahtarsız, ücretsiz; kapsamı daha dar)
 * Aramalar sunucu üzerinden gider: davetlinin ya da ev sahibinin IP adresi
 * Google'a veya OpenStreetMap'e hiç ulaşmaz.
 */

export interface PlaceSuggestion {
  /** "g:<placeId>" (Google, koordinat seçimde alınır) ya da "o:<lat>,<lng>" (OSM) */
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface Place {
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Google yer kimliği; Google Haritalar'da doğrudan o işletmeyi açar */
  placeId: string;
}

export { directionLinks, type PlaceRef } from "./directions";
import { searchFold } from "./format";

const TIMEOUT = 6000;
const UA = "Buyrun/1.0 (dijital davetiye; https://buyrun.vercel.app)";
/** Türkiye'nin sınır kutusu (batı, güney, doğu, kuzey) */
const TR_BBOX = "25.5,35.7,44.9,42.2";

const tamam = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
/** Adresin sonundaki ülke adını at; davetliler zaten Türkiye'de. */
const kisalt = (a: string) => a.replace(/,?\s*(Türkiye|Turkey)$/i, "").trim();

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT), cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Google Places (New)                                                 */
/* ------------------------------------------------------------------ */

const googleKey = () => process.env.GOOGLE_MAPS_API_KEY?.trim() || "";

async function googleSearch(q: string, session: string, near?: Near): Promise<PlaceSuggestion[]> {
  const data = await getJson("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": googleKey() },
    body: JSON.stringify({
      input: q, languageCode: "tr", regionCode: "tr", includedRegionCodes: ["tr"], sessionToken: session,
      ...(near ? { locationBias: { circle: { center: { latitude: near.lat, longitude: near.lng }, radius: 50000 } } } : {}),
    }),
  });
  type P = { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } };
  return ((data.suggestions ?? []) as P[])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<P["placePrediction"]> => Boolean(p?.placeId))
    .map((p) => ({
      id: `g:${p.placeId}`,
      name: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
      address: kisalt(p.structuredFormat?.secondaryText?.text ?? ""),
    }));
}

async function googleDetails(placeId: string, session: string): Promise<Place | null> {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=tr&regionCode=tr&sessionToken=${encodeURIComponent(session)}`;
  const d = await getJson(url, {
    headers: { "X-Goog-Api-Key": googleKey(), "X-Goog-FieldMask": "id,displayName,formattedAddress,location" },
  });
  const lat = Number(d.location?.latitude), lng = Number(d.location?.longitude);
  if (!tamam(lat, lng)) return null;
  return { name: d.displayName?.text ?? "", address: kisalt(d.formattedAddress ?? ""), lat, lng, placeId: d.id ?? placeId };
}

/* ------------------------------------------------------------------ */
/* TomTom                                                              */
/* ------------------------------------------------------------------ */

const tomtomKey = () => process.env.TOMTOM_API_KEY?.trim() || "";

async function tomtomSearch(q: string, near?: Near): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    key: tomtomKey(), typeahead: "true", limit: "6", countrySet: "TR", language: "tr-TR",
    idxSet: "POI,PAD,Addr,Str,Geo",
  });
  if (near) { params.set("lat", String(near.lat)); params.set("lon", String(near.lng)); }
  const data = await getJson(`https://api.tomtom.com/search/2/search/${encodeURIComponent(q)}.json?${params}`);
  type R = { type: string; poi?: { name?: string }; address?: Record<string, string | undefined>; position?: { lat: number; lon: number } };
  return ((data.results ?? []) as R[]).flatMap((r) => {
    const lat = Number(r.position?.lat), lng = Number(r.position?.lon);
    const a = r.address ?? {};
    const name = r.poi?.name || [a.streetName, a.streetNumber].filter(Boolean).join(" No:") || a.freeformAddress || "";
    if (!name || !tamam(lat, lng)) return [];
    const sokak = [a.streetName, a.streetNumber].filter(Boolean).join(" No:");
    const address = [sokak !== name ? sokak : "", a.municipalitySubdivision, a.municipality, a.countrySubdivision]
      .filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(", ");
    return [{ id: `o:${lat.toFixed(6)},${lng.toFixed(6)}`, name, address, lat, lng }];
  });
}

/* ------------------------------------------------------------------ */
/* OpenStreetMap / Photon                                              */
/* ------------------------------------------------------------------ */

/** Yakınlık tercihi: salon seçildiyse servis kalkış yeri gibi aramalar salonun çevresini öne alır. */
export interface Near { lat: number; lng: number }

async function osmSearch(q: string, near?: Near): Promise<PlaceSuggestion[]> {
  const bias = near ? `&lat=${near.lat}&lon=${near.lng}&location_bias_scale=0.4` : "";
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&bbox=${TR_BBOX}${bias}`;
  const data = await getJson(url, { headers: { "User-Agent": UA } });
  type F = { geometry: { coordinates: [number, number] }; properties: Record<string, string | undefined> };
  const seen = new Set<string>();
  return ((data.features ?? []) as F[]).flatMap((f) => {
    const p = f.properties;
    const [lng, lat] = f.geometry.coordinates;
    const name = p.name || [p.street, p.housenumber].filter(Boolean).join(" ");
    if (!name || !tamam(lat, lng)) return [];
    const sokak = [p.street, p.housenumber].filter(Boolean).join(" No:");
    const address = [sokak !== name ? sokak : "", p.district || p.locality, p.city || p.county, p.state]
      .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
    const key = `${name}|${address}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ id: `o:${lat.toFixed(6)},${lng.toFixed(6)}`, name, address, lat, lng }];
  });
}

/* ------------------------------------------------------------------ */
/* Dışarıya açık işlemler                                              */
/* ------------------------------------------------------------------ */

export type Provider = "google" | "tomtom" | "osm" | "karma";

/** Sorgudaki kelimelerin kaçı yerin adında geçiyor; ad sorguyla başlıyorsa ek puan. */
function uyum(q: string, name: string) {
  const qf = searchFold(q), nf = searchFold(name);
  const words = qf.split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return 0;
  const hit = words.filter((w) => nf.includes(w)).length / words.length;
  return hit + (nf.startsWith(qf) ? 0.5 : 0) + (nf === qf ? 0.5 : 0);
}

/** Aynı ad ve 300 metreden yakınsa aynı yer sayılır. */
function ayniYer(a: PlaceSuggestion, b: PlaceSuggestion) {
  if (searchFold(a.name) !== searchFold(b.name) || a.lat == null || b.lat == null) return false;
  const dLat = (a.lat - b.lat) * 111_000, dLng = (a.lng! - b.lng!) * 85_000;
  return Math.hypot(dLat, dLng) < 300;
}

/**
 * TomTom ve OpenStreetMap birbirini tamamlıyor: biri "Kent Düğün Salonu"nu, öbürü
 * "Çırağan Sarayı"nı buluyor. İkisine birden sorulur, sonuçlar ada uyuma göre sıralanır.
 */
function birlestir(q: string, lists: PlaceSuggestion[][]) {
  const all: { s: PlaceSuggestion; score: number; order: number }[] = [];
  lists.forEach((list, li) => list.forEach((s, i) => all.push({ s, score: uyum(q, s.name), order: i * 2 + li })));
  all.sort((a, b) => b.score - a.score || a.order - b.order);
  const out: PlaceSuggestion[] = [];
  for (const { s } of all) if (!out.some((o) => ayniYer(o, s))) out.push(s);
  return out.slice(0, 6);
}

/**
 * Yazılan metne göre öneriler ve hangi kaynaktan geldikleri (listenin altında
 * kaynak belirtilir). Hiçbiri sonuç vermezse boş liste; form elle doldurulabilir.
 */
export async function searchPlaces(q: string, session: string, near?: Near): Promise<{ suggestions: PlaceSuggestion[]; provider: Provider }> {
  const text = q.trim().slice(0, 120);
  if (text.length < 3) return { suggestions: [], provider: "osm" };
  const hata = (p: string) => (e: unknown) => {
    console.error(`[yer] ${p} arama:`, e instanceof Error ? e.message : e);
    return [] as PlaceSuggestion[];
  };
  if (googleKey()) {
    const g = await googleSearch(text, session, near).catch(hata("google"));
    if (g.length) return { suggestions: g, provider: "google" };
  }
  const [t, o] = await Promise.all([
    tomtomKey() ? tomtomSearch(text, near).catch(hata("tomtom")) : Promise.resolve([] as PlaceSuggestion[]),
    osmSearch(text, near).catch(hata("osm")),
  ]);
  const suggestions = birlestir(text, [t, o]);
  const kaynaklar = new Set(suggestions.map((s) => (t.includes(s) ? "tomtom" : "osm")));
  const provider: Provider = kaynaklar.size > 1 ? "karma" : kaynaklar.has("tomtom") ? "tomtom" : "osm";
  return { suggestions, provider };
}

/** Google önerisinin koordinatı seçim anında alınır (oturum fiyatlandırması için). */
export async function placeDetails(id: string, session: string): Promise<Place | null> {
  if (!id.startsWith("g:") || !googleKey()) return null;
  try {
    return await googleDetails(id.slice(2), session);
  } catch (e) {
    console.error("[yer] google ayrıntı:", e instanceof Error ? e.message : e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Yapıştırılan harita linki                                           */
/* ------------------------------------------------------------------ */

/** Yalnızca bu adreslere istek atılır; başka bir adrese yönlendirme izlenmez. */
const KISA_LINK = ["maps.app.goo.gl", "goo.gl"];
const HARITA = [/^(www\.|maps\.)?google\.com(\.tr)?$/, /^maps\.apple\.com$/, /^(www\.)?yandex\.(com\.tr|com|ru)$/];

function hostOf(raw: string) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" ? u.hostname.toLowerCase() : "";
  } catch {
    return "";
  }
}

/** Uzun harita adresinden ad ve koordinat çıkarır. Ağ isteği yapmaz. */
export function parseMapUrl(raw: string): Omit<Place, "address"> | null {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  const host = u.hostname.toLowerCase();
  const text = decodeURIComponent(u.href);
  const num = (a?: string, b?: string) => (a && b && tamam(Number(a), Number(b)) ? { lat: Number(a), lng: Number(b) } : null);

  if (/google\./.test(host)) {
    // İşletmenin kendi noktası (!3d…!4d…) haritanın ortasından (@…) daha doğrudur
    const pin = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const at = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const qp = (u.searchParams.get("q") || u.searchParams.get("query") || u.searchParams.get("destination") || "").match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
    const c = num(pin?.[1], pin?.[2]) ?? num(qp?.[1], qp?.[2]) ?? num(at?.[1], at?.[2]);
    if (!c) return null;
    const name = (text.match(/\/place\/([^/@]+)/)?.[1] ?? "").replace(/\+/g, " ").trim();
    const placeId = u.searchParams.get("query_place_id") || "";
    return { ...c, name: /^-?\d/.test(name) ? "" : name, placeId };
  }
  if (host === "maps.apple.com") {
    const [a, b] = (u.searchParams.get("ll") || u.searchParams.get("coordinate") || u.searchParams.get("daddr") || "").split(",");
    const c = num(a, b);
    return c ? { ...c, name: u.searchParams.get("q") || u.searchParams.get("name") || "", placeId: "" } : null;
  }
  if (/yandex\./.test(host)) {
    // Yandex sırayı ters yazar: boylam,enlem
    const [lng, lat] = (u.searchParams.get("pt") || u.searchParams.get("ll") || "").split(",");
    const c = num(lat, lng);
    return c ? { ...c, name: "", placeId: "" } : null;
  }
  return null;
}

/** Kısa linki (maps.app.goo.gl) en fazla 3 adımda açar; yalnızca harita adreslerine gider. */
export async function resolveMapLink(raw: string): Promise<Omit<Place, "address"> | null> {
  let current = raw.trim();
  for (let i = 0; i < 4; i++) {
    const host = hostOf(current);
    if (!host) return null;
    if (HARITA.some((r) => r.test(host))) return parseMapUrl(current);
    if (!KISA_LINK.includes(host)) return null;
    try {
      const res = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT), headers: { "User-Agent": UA } });
      const next = res.headers.get("location");
      if (!next) return null;
      current = new URL(next, current).href;
    } catch {
      return null;
    }
  }
  return null;
}

/** "40.22,28.97" → yakınlık; geçersizse yok sayılır. */
export function parseNear(v: string | null): Near | undefined {
  const [a, b] = (v || "").split(",").map(Number);
  return tamam(a, b) && v ? { lat: a, lng: b } : undefined;
}

export const looksLikeMapLink = (v: string) => /^https:\/\/\S+$/.test(v.trim()) && /goo\.gl|google\.|maps\.apple\.com|yandex\./.test(v);

/* ------------------------------------------------------------------ */
/* Formdan okuma                                                       */
/* ------------------------------------------------------------------ */

/** Mekân seçicinin gizli alanlarını okur ve doğrular. Geçersizse konumsuz kaydedilir. */
export function placeFromForm(f: FormData, prefix: string) {
  const n = (k: string) => String(f.get(prefix ? `${prefix}_${k}` : k) ?? "").trim();
  const lat = Number(n("lat")), lng = Number(n("lng"));
  const ok = n("lat") !== "" && n("lng") !== "" && tamam(lat, lng);
  const placeId = n("place");
  return {
    lat: ok ? lat : null,
    lng: ok ? lng : null,
    placeId: ok && /^[A-Za-z0-9_-]{10,300}$/.test(placeId) ? placeId : "",
    directions: n("tarif").slice(0, 160),
  };
}
