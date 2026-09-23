/**
 * Etkinlik saatine göre hava tahmini.
 *
 * Kaynak MET Norway (Norveç Meteoroloji Enstitüsü): ücretsiz ve ticari kullanıma açık,
 * CC BY 4.0 lisanslı. Şartları: uygulamayı tanıtan User-Agent, önbellek, kaynak gösterimi.
 * (Open-Meteo'nun ücretsiz sürümü ticari kullanıma kapalı olduğu için seçilmedi.)
 *
 * Tahmin yaklaşık 9 gün ileriyi kapsar; daha uzak etkinliklerde hiç gösterilmez.
 * Servis yanıt vermezse sessizce gösterilmez, sayfa yavaşlamaz.
 */

export interface Forecast {
  /** Etkinlik saatindeki sıcaklık (°C, yuvarlanmış) */
  temp: number;
  /** Günün en yüksek / en düşük sıcaklığı */
  max: number;
  min: number;
  /** "Parçalı bulutlu" gibi */
  label: string;
  icon: string;
  /** Etkinlik saatinden sonraki 6 saatte beklenen yağış (mm) */
  rain: number;
}

const UA = "Buyrun/1.0 (+https://buyrun.vercel.app)";
const TR_OFFSET_MS = 3 * 3600_000;
export const WEATHER_CREDIT = { text: "Hava tahmini: MET Norway", href: "https://www.met.no/en/free-meteorological-data/Licensing-and-crediting" };

/** MET simge kodunu ("partlycloudy_day") Türkçe etikete ve simgeye çevirir. */
export function describe(symbol: string): { label: string; icon: string } {
  const s = symbol.replace(/_(day|night|polartwilight)$/, "");
  // Akşam düğünlerinde "güneşli" demeyelim
  const gece = symbol.endsWith("_night");
  if (gece && s === "clearsky") return { label: "Açık", icon: "🌙" };
  if (gece && s === "fair") return { label: "Az bulutlu", icon: "🌙" };
  if (s.includes("thunder")) return { label: "Gök gürültülü sağanak", icon: "⛈️" };
  if (s.includes("sleet")) return { label: "Karla karışık yağmur", icon: "🌨️" };
  if (s.includes("snow")) return { label: s.startsWith("heavy") ? "Yoğun kar" : "Karlı", icon: "🌨️" };
  if (s.includes("showers")) return { label: "Sağanak yağışlı", icon: "🌦️" };
  if (s === "heavyrain") return { label: "Kuvvetli yağmurlu", icon: "🌧️" };
  if (s === "lightrain") return { label: "Hafif yağmurlu", icon: "🌧️" };
  if (s === "rain") return { label: "Yağmurlu", icon: "🌧️" };
  const map: Record<string, { label: string; icon: string }> = {
    clearsky: { label: "Açık ve güneşli", icon: "☀️" },
    fair: { label: "Az bulutlu", icon: "🌤️" },
    partlycloudy: { label: "Parçalı bulutlu", icon: "⛅" },
    cloudy: { label: "Kapalı", icon: "☁️" },
    fog: { label: "Sisli", icon: "🌫️" },
  };
  return map[s] ?? { label: "Değişken", icon: "🌤️" };
}

type Entry = {
  time: string;
  data: {
    instant: { details: { air_temperature?: number } };
    next_1_hours?: { summary: { symbol_code: string }; details?: { precipitation_amount?: number } };
    next_6_hours?: { summary: { symbol_code: string }; details?: { precipitation_amount?: number } };
    next_12_hours?: { summary: { symbol_code: string } };
  };
};

/** Saf hesap: MET zaman serisinden belirli gün ve saatin tahminini çıkarır. */
export function pickForecast(series: Entry[], dateIso: string, timeHHmm: string): Forecast | null {
  const [hh, mm] = timeHHmm.split(":").map(Number);
  const target = Date.parse(`${dateIso}T00:00:00Z`) + ((hh || 0) * 60 + (mm || 0)) * 60_000 - TR_OFFSET_MS;
  const localDate = (t: string) => new Date(Date.parse(t) + TR_OFFSET_MS).toISOString().slice(0, 10);
  const day = series.filter((e) => localDate(e.time) === dateIso && e.data.instant.details.air_temperature != null);
  if (!day.length) return null;
  const temps = day.map((e) => e.data.instant.details.air_temperature as number);
  // Etkinlik saatine en yakın ölçüm (en fazla 6 saat uzağında)
  const near = [...day].sort((a, b) => Math.abs(Date.parse(a.time) - target) - Math.abs(Date.parse(b.time) - target))[0];
  if (Math.abs(Date.parse(near.time) - target) > 6 * 3600_000) return null;
  const symbol = near.data.next_1_hours?.summary.symbol_code ?? near.data.next_6_hours?.summary.symbol_code ?? near.data.next_12_hours?.summary.symbol_code;
  if (!symbol) return null;
  // Etkinlikten sonraki 6 saatin yağışı: saatlik veri varsa topla, yoksa 6 saatlik değeri al
  const window = series.filter((e) => { const t = Date.parse(e.time); return t >= target - 3600_000 && t < target + 6 * 3600_000; });
  const hourly = window.filter((e) => e.data.next_1_hours);
  const rain = hourly.length
    ? hourly.reduce((s, e) => s + (e.data.next_1_hours?.details?.precipitation_amount ?? 0), 0)
    : near.data.next_6_hours?.details?.precipitation_amount ?? 0;
  return {
    temp: Math.round(near.data.instant.details.air_temperature as number),
    max: Math.round(Math.max(...temps)),
    min: Math.round(Math.min(...temps)),
    rain: Math.round(rain * 10) / 10,
    ...describe(symbol),
  };
}

/** Etkinlik 0–9 gün içindeyse tahmini getirir; aksi hâlde ya da hata olursa null. */
export async function forecastFor(lat: number | null | undefined, lng: number | null | undefined, dateIso: string, timeHHmm: string, todayIso: string): Promise<Forecast | null> {
  if (lat == null || lng == null) return null;
  const days = (Date.parse(dateIso) - Date.parse(todayIso)) / 86_400_000;
  if (!(days >= 0 && days <= 9)) return null;
  // 2 ondalık (~1 km) hava için yeterli; aynı salonun davetlileri aynı önbelleği kullanır
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(2)}&lon=${lng.toFixed(2)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
      // MET tahmini yaklaşık saatte bir yeniliyor; şartları gereği tekrar tekrar sorulmaz
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return pickForecast(json.properties?.timeseries ?? [], dateIso, timeHHmm);
  } catch {
    return null;
  }
}
