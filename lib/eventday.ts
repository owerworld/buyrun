/**
 * Düğün günü modu: davetiye, etkinliğe ne kadar kaldığına göre kendini değiştirir.
 * Türkiye 2016'dan beri sabit UTC+3; saatler buna göre hesaplanır.
 */

const TR_OFFSET_MS = 3 * 3600_000;
/** Başladıktan sonra kaç dakika "şu an devam ediyor" denir */
const SURE_DK = 6 * 60;

export interface DayItem { title: string; date: string; time: string }

export type DayStatus<T extends DayItem = DayItem> =
  | { kind: "bugun"; item: T; minutes: number }
  | { kind: "suruyor"; item: T }
  | { kind: "yarin"; item: T }
  | { kind: "yakinda"; item: T; days: number };

/** Türkiye saatiyle bugünün tarihi (YYYY-AA-GG). */
export const todayTr = (now = new Date()) => new Date(now.getTime() + TR_OFFSET_MS).toISOString().slice(0, 10);

const dakika = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return (h || 0) * 60 + (m || 0); };

/** Sıradaki etkinliğin durumu; 7 günden uzaksa ya da hepsi bittiyse null. */
export function dayStatus<T extends DayItem>(items: T[], now = new Date()): DayStatus<T> | null {
  const t = new Date(now.getTime() + TR_OFFSET_MS);
  const today = t.toISOString().slice(0, 10);
  const nowMin = t.getUTCHours() * 60 + t.getUTCMinutes();
  const sorted = [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  for (const item of sorted) {
    const days = Math.round((Date.parse(item.date) - Date.parse(today)) / 86_400_000);
    if (days < 0) continue;
    if (days === 0) {
      const start = dakika(item.time);
      if (nowMin < start) return { kind: "bugun", item, minutes: start - nowMin };
      if (nowMin < start + SURE_DK) return { kind: "suruyor", item };
      continue; // bugünkü bitti, sıradakine bak
    }
    if (days === 1) return { kind: "yarin", item };
    if (days <= 7) return { kind: "yakinda", item, days };
    return null;
  }
  return null;
}

/** "2 saat 15 dakika" */
export function kalanMetin(minutes: number) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (!h) return `${m} dakika`;
  return m ? `${h} saat ${m} dakika` : `${h} saat`;
}
