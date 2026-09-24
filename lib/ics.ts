import type { EventRow, Invitation } from "./data";

/**
 * Davetliye ".ics" takvim dosyası üretir (iPhone, Android ve Outlook açar).
 *
 * Türkiye 2016'dan beri yaz saati uygulamıyor, sabit UTC+3. Bu yüzden saatleri
 * UTC'ye çevirip yazıyoruz; böylece dosyaya VTIMEZONE bloğu koymaya gerek kalmıyor
 * ve saat her telefonda doğru görünüyor.
 */
const TR_OFFSET_HOURS = 3;
/** Etkinlikler için varsayılan süre. Davetiyede bitiş saati sorulmuyor. */
const DEFAULT_HOURS = 4;

const pad = (n: number) => String(n).padStart(2, "0");

function utcStamp(dateIso: string, timeHHmm: string, addHours = 0) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const [hh, mm] = timeHHmm.split(":").map(Number);
  const t = Date.UTC(y, m - 1, d, (hh || 0) - TR_OFFSET_HOURS + addHours, mm || 0);
  const dt = new Date(t);
  return (
    `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}` +
    `T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
  );
}

/** Takvim biçiminde ters eğik çizgi, noktalı virgül, virgül ve satır sonu kaçışlanır. */
const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Satırlar 75 bayttan uzun olamaz; devamı bir boşlukla alt satıra taşınır. */
function fold(line: string) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    const limit = parts.length === 0 ? 75 : 74;
    let end = Math.min(start + limit, bytes.length);
    // Çok baytlı karakterin ortasından bölme
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
  }
  return parts.join("\r\n ");
}

/**
 * Hatırlatma: takvim uygulaması etkinlikten bir gün önce haber verir. Buyrun kimseye
 * mesaj göndermez; hatırlatmayı davetlinin kendi takvimi yapar.
 */
const hatirlatma = (baslik: string) => [
  "BEGIN:VALARM",
  "ACTION:DISPLAY",
  "TRIGGER:-P1D",
  fold(`DESCRIPTION:${esc(`Yarın: ${baslik}`)}`),
  "END:VALARM",
];

export function buildIcs(inv: Invitation, events: EventRow[], siteUrl: string) {
  const stamp = utcStamp(new Date().toISOString().slice(0, 10), "00:00");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Buyrun//Davetiye//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@buyrun`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utcStamp(e.event_date, e.event_time)}`,
      `DTEND:${utcStamp(e.event_date, e.event_time, DEFAULT_HOURS)}`,
      fold(`SUMMARY:${esc(`${inv.name_a} ile ${inv.name_b} — ${e.title}`)}`),
      fold(`LOCATION:${esc([e.venue, e.address, inv.city].filter(Boolean).join(", "))}`),
      // Koordinat varsa takvim uygulaması "yol tarifi" düğmesini doğrudan doğru yere açar
      ...(e.lat != null && e.lng != null ? [`GEO:${e.lat};${e.lng}`] : []),
      fold(`DESCRIPTION:${esc(`Davetiye ve katılım bildirimi: ${siteUrl}`)}`),
      ...hatirlatma(e.title),
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Tek günlük davet (doğum günü, yemek, mevlid…) için takvim dosyası. */
export function buildEventIcs(
  e: { id: string; title: string; date: string; time: string; venue: string; address: string; lat?: number | null; lng?: number | null },
  url: string
) {
  const stamp = utcStamp(new Date().toISOString().slice(0, 10), "00:00");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Buyrun//Davet//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@buyrun`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${utcStamp(e.date, e.time)}`,
    // Tek günlük davetlerde süre daha kısa: 3 saat
    `DTEND:${utcStamp(e.date, e.time, 3)}`,
    fold(`SUMMARY:${esc(e.title)}`),
    fold(`LOCATION:${esc([e.venue, e.address].filter(Boolean).join(", "))}`),
    ...(e.lat != null && e.lng != null ? [`GEO:${e.lat};${e.lng}`] : []),
    fold(`DESCRIPTION:${esc(`Davet ve katılım yanıtı: ${url}`)}`),
    ...hatirlatma(e.title),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n") + "\r\n";
}

export const icsResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="davetiye.ics"',
      "Cache-Control": "no-store",
    },
  });
