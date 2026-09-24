import { COVER_CATALOG } from "./coverCatalog";
import { q } from "./db";
import { id, token } from "./tokens";
import { addDays, todayIso } from "./format";
import { isFoto } from "./fotolar";

export type MobileStatus = "pending" | "going" | "maybe" | "declined";
export type MobileInput = {
  title: string; category: string; hostName: string; date: string; time: string;
  venue: string; address: string; description: string; coverId: string; coverData: string | null; capacity: number | null;
  /** Hazır kapak fotoğrafı (lib/fotolar.ts); boşsa çizim kapak ya da kullanıcının kendi görseli */
  photoId?: string;
};
type EventRow = {
  id: string; manage_token: string; invite_token: string; title: string; category: string;
  host_name: string; event_date: string; event_time: string; venue: string; address: string;
  description: string; cover_id: string; cover_data: string | null; capacity: number | null; delete_after: string; created_at: string;
  /** Web sihirbazının tasarımı. Boşsa (uygulamadan oluşturulan etkinlik) fotoğraflı kapak kullanılır. */
  theme: string; font: string; ornament: string; pattern: string;
  lat: number | null; lng: number | null; place_id: string; directions: string;
  photo_id: string; answers: string; details: string;
};

/** Web sihirbazının son adımında türe göre sorulan ayrıntılar. Hepsi isteğe bağlı. */
export interface EventDetails {
  /** Günün akışı: her satıra bir madde ("14:00 Mevlid-i Şerif") */
  akis?: string;
  /** Mevlidi okuyacak hoca */
  mevlidhan?: string;
  /** Sürpriz partide sürprizin sahibinin geleceği saat (SS:DD) */
  surpriz?: string;
}
const temizMetin = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max) : "";
/** Ayrıntıları doğrular: bilinmeyen alan atılır, uzunluklar sınırlı, saat biçimi denetlenir. */
export function cleanDetails(v: unknown): EventDetails {
  const b = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const out: EventDetails = {};
  const akis = temizMetin(b.akis, 600), hoca = temizMetin(b.mevlidhan, 80), saat = temizMetin(b.surpriz, 5);
  if (akis) out.akis = akis;
  if (hoca) out.mevlidhan = hoca;
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(saat)) out.surpriz = saat;
  return out;
}
export function detailsOf(row: { details?: string | null }): EventDetails {
  try { return cleanDetails(JSON.parse(row.details || "{}")); } catch { return {}; }
}

/** Etkinliğin tasarım eksenleri; değerler lib/themes.ts ve lib/design.ts listelerinden gelir. */
export interface EventDesign { theme: string; font: string; ornament: string; pattern?: string }
type GuestRow = {
  id: string; event_id: string; name: string; token: string; status: MobileStatus;
  count: number; note: string; responded_at: string | null; created_at: string;
};
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;
const STATUS: MobileStatus[] = ["pending", "going", "maybe", "declined"];
const globalMobile = globalThis as unknown as { __buyrunMobileReady?: Promise<void> };

// These independent tables deliberately do not modify the wedding/family data.
export async function mobileReady() {
  if (!globalMobile.__buyrunMobileReady) {
    globalMobile.__buyrunMobileReady = (async () => {
      await q(`CREATE TABLE IF NOT EXISTS mobile_events (
        id TEXT PRIMARY KEY, manage_token TEXT UNIQUE NOT NULL, invite_token TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL, category TEXT NOT NULL, host_name TEXT NOT NULL,
        event_date TEXT NOT NULL, event_time TEXT NOT NULL, venue TEXT NOT NULL,
        address TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
        cover_id TEXT NOT NULL DEFAULT 'cherry', cover_data TEXT, capacity INT,
        delete_after TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS cover_data TEXT`);
      // Web sihirbazının tasarımı (renk, yazı, süsleme); uygulamanın etkinliklerinde boş kalır
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT ''`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS font TEXT NOT NULL DEFAULT ''`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS ornament TEXT NOT NULL DEFAULT ''`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS pattern TEXT NOT NULL DEFAULT ''`);
      // Mekânın konumu (web'deki mekân seçiciden); uygulama henüz göndermiyor
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS place_id TEXT NOT NULL DEFAULT ''`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS directions TEXT NOT NULL DEFAULT ''`);
      // Türe uygun, telifsiz kapak fotoğrafı (lib/fotolar.ts) ve sihirbaz cevapları (metin önerileri, hitap)
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS photo_id TEXT NOT NULL DEFAULT ''`);
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS answers TEXT NOT NULL DEFAULT ''`);
      // Türe özel ayrıntılar (günün akışı, mevlidhan, sürpriz saati) JSON olarak
      await q(`ALTER TABLE mobile_events ADD COLUMN IF NOT EXISTS details TEXT NOT NULL DEFAULT '{}'`);
      await q(`CREATE TABLE IF NOT EXISTS mobile_guests (
        id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES mobile_events(id) ON DELETE CASCADE,
        name TEXT NOT NULL, token TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','going','maybe','declined')),
        count INT NOT NULL DEFAULT 1 CHECK (count BETWEEN 1 AND 20), note TEXT NOT NULL DEFAULT '',
        responded_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
      await q(`CREATE INDEX IF NOT EXISTS mobile_guests_event_idx ON mobile_guests(event_id)`);
      await q(`CREATE INDEX IF NOT EXISTS mobile_events_expiry_idx ON mobile_events(delete_after)`);
    })().catch((error) => { globalMobile.__buyrunMobileReady = undefined; throw error; });
  }
  return globalMobile.__buyrunMobileReady;
}

export class MobileError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function textField(value: unknown, label: string, max: number, required = true): string {
  if (value == null && !required) return "";
  if (typeof value !== "string") throw new MobileError(`${label} geçerli bir metin olmalı.`);
  const result = value.trim();
  if ((required && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) {
    throw new MobileError(`${label} ${required ? "1–" : "en fazla "}${max} karakter olmalı.`);
  }
  return result;
}
export function validateCoverData(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > 3_000_000) throw new MobileError("Kapak görseli en fazla 2 MB olmalı.");
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) throw new MobileError("JPEG, PNG veya WebP görseli seç.");
  const bytes = Buffer.from(match[2], "base64");
  const valid = match[1] === "jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : match[1] === "png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP";
  if (!valid || bytes.length < 24 || bytes.toString("base64") !== match[2]) throw new MobileError("Görsel dosyası okunamadı. Başka bir görsel seç.");
  return value;
}
function photoField(value: unknown) {
  if (value == null || value === "") return "";
  if (!isFoto(value)) throw new MobileError("Geçerli bir kapak fotoğrafı seç.");
  return value;
}
export function validateEvent(body: unknown, existing?: MobileInput): MobileInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new MobileError("Etkinlik bilgileri geçersiz.");
  const b = { ...existing, ...body } as Record<string, unknown>;
  const date = textField(b.date, "Tarih", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) throw new MobileError("Geçerli bir tarih seç.");
  if (date < todayIso() && date !== existing?.date) throw new MobileError("Etkinlik tarihi bugün veya daha sonra olmalı.");
  if (date > addDays(todayIso(), 365 * 10)) throw new MobileError("Etkinlik tarihi en fazla 10 yıl ileride olabilir.");
  const time = textField(b.time, "Saat", 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new MobileError("Geçerli bir saat seç (SS:DD).");
  const coverId = textField(b.coverId || "cherry", "Kapak", 64);
  if (!["cherry", "midnight", "bloom"].includes(coverId) && !Object.hasOwn(COVER_CATALOG, coverId)) throw new MobileError("Geçerli bir kapak seç.");
  let capacity: number | null = null;
  if (b.capacity != null && b.capacity !== "") {
    if (typeof b.capacity !== "number" || !Number.isInteger(b.capacity) || b.capacity < 1 || b.capacity > 10000) throw new MobileError("Kapasite 1–10000 arasında bir tam sayı olmalı.");
    capacity = b.capacity;
  }
  return {
    title: textField(b.title, "Etkinlik adı", 100), category: textField(b.category, "Kategori", 40),
    hostName: textField(b.hostName, "Ev sahibi", 80), date, time,
    venue: textField(b.venue, "Mekân", 160), address: textField(b.address, "Adres", 400, false),
    description: textField(b.description, "Açıklama", 2000, false), coverId, coverData: validateCoverData(b.coverData), capacity,
    photoId: photoField(b.photoId),
  };
}
export function validateGuest(body: unknown, existing?: Partial<GuestRow>, publicResponse = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new MobileError("Davetli bilgileri geçersiz.");
  const b = { status: "pending", count: 1, note: "", ...existing, ...body } as Record<string, unknown>;
  const name = textField(b.name, "Ad soyad", 100);
  if (typeof b.status !== "string" || !STATUS.includes(b.status as MobileStatus) || (publicResponse && b.status === "pending")) throw new MobileError("Katılım durumunu seç.");
  if (typeof b.count !== "number" || !Number.isInteger(b.count) || b.count < 1 || b.count > 20) throw new MobileError("Kişi sayısı 1–20 arasında olmalı.");
  return { name, status: b.status as MobileStatus, count: b.count, note: textField(b.note, "Not", 500, false) };
}
export async function mobileEventByToken(value: string, mode: "manage" | "invite") {
  if (!TOKEN.test(value)) return null;
  await mobileReady();
  return (await q<EventRow>(`SELECT * FROM mobile_events WHERE ${mode === "manage" ? "manage_token" : "invite_token"}=$1 AND delete_after >= $2`, [value, todayIso()]))[0] || null;
}
function publicFields(row: EventRow) {
  return { id: row.id, title: row.title, category: row.category, hostName: row.host_name,
    date: row.event_date, time: row.event_time, venue: row.venue, address: row.address,
    description: row.description, coverId: row.cover_id, coverData: row.cover_data, capacity: row.capacity,
    photoId: row.photo_id || "" };
}
/** Davet sayfasının tasarımı. Uygulama bu alanları tanımaz; API yanıtına bu yüzden eklenmez. */
/** Davet sayfasındaki yol tarifi için mekânın konumu. */
export const placeOf = (row: EventRow) => ({
  venue: row.venue, address: row.address, lat: row.lat, lng: row.lng, placeId: row.place_id, directions: row.directions,
});
export interface EventPlace { lat: number | null; lng: number | null; placeId: string; directions: string }
export const designOf = (row: EventRow): EventDesign | null =>
  row.theme ? { theme: row.theme, font: row.font || "klasik", ornament: row.ornament || "sirma", pattern: row.pattern || "sade" } : null;
export function guestFields(row: GuestRow, event: EventRow, origin: string) {
  return { id: row.id, name: row.name, status: row.status, count: row.count, note: row.note,
    token: row.token, rsvpUrl: `${origin}/m/${event.invite_token}?guest=${row.token}`,
    respondedAt: row.responded_at, createdAt: row.created_at };
}
export async function managedEvent(row: EventRow, origin: string) {
  const guests = await q<GuestRow>(`SELECT * FROM mobile_guests WHERE event_id=$1 ORDER BY created_at ASC, id ASC`, [row.id]);
  return { ...publicFields(row), manageToken: row.manage_token, inviteToken: row.invite_token,
    shareUrl: `${origin}/m/${row.invite_token}`, createdAt: row.created_at, deleteAfter: row.delete_after,
    guests: guests.map((guest) => guestFields(guest, row, origin)) };
}
export async function publicEvent(row: EventRow, guestToken?: string) {
  const result = { ...publicFields(row) };
  if (!guestToken) return { ...result, guest: null };
  if (!TOKEN.test(guestToken)) throw new MobileError("Bu kişisel davet bağlantısı geçersiz.", 404);
  const guest = (await q<GuestRow>(`SELECT * FROM mobile_guests WHERE event_id=$1 AND token=$2`, [row.id, guestToken]))[0];
  if (!guest) throw new MobileError("Bu kişisel davet bağlantısı geçersiz.", 404);
  return { ...result, guest: { name: guest.name, status: guest.status, count: guest.count, note: guest.note } };
}
export async function createMobileEvent(data: MobileInput, origin: string, design?: EventDesign, place?: EventPlace, answers = "", details: EventDetails = {}) {
  await mobileReady();
  const rows = await q<EventRow>(`INSERT INTO mobile_events
    (id,manage_token,invite_token,title,category,host_name,event_date,event_time,venue,address,description,cover_id,cover_data,capacity,delete_after,theme,font,ornament,lat,lng,place_id,directions,pattern,photo_id,answers,details)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26) RETURNING *`,
    [id(), token(24), token(24), data.title, data.category, data.hostName, data.date, data.time, data.venue,
      data.address, data.description, data.coverId, data.coverData, data.capacity, addDays(data.date, 90),
      design?.theme ?? "", design?.font ?? "", design?.ornament ?? "",
      place?.lat ?? null, place?.lng ?? null, place?.placeId ?? "", place?.directions ?? "", design?.pattern ?? "",
      data.photoId ?? "", answers, JSON.stringify(cleanDetails(details))]);
  return managedEvent(rows[0], origin);
}
export async function editMobileEvent(row: EventRow, data: MobileInput, origin: string) {
  const updated = (await q<EventRow>(`UPDATE mobile_events SET title=$1,category=$2,host_name=$3,event_date=$4,
    event_time=$5,venue=$6,address=$7,description=$8,cover_id=$9,cover_data=$10,capacity=$11,delete_after=$12,photo_id=$14,
    lat=CASE WHEN venue=$6 THEN lat END, lng=CASE WHEN venue=$6 THEN lng END,
    place_id=CASE WHEN venue=$6 THEN place_id ELSE '' END WHERE id=$13 RETURNING *`,
    [data.title,data.category,data.hostName,data.date,data.time,data.venue,data.address,data.description,data.coverId,data.coverData,data.capacity,addDays(data.date,90),row.id,data.photoId ?? row.photo_id ?? ""]))[0];
  return managedEvent(updated, origin);
}
export const eventInput = (row: EventRow): MobileInput => publicFields(row);
/** Web'deki düzenleme ekranından konumu yazar (mekân adı kaydedildikten sonra). */
export async function setMobilePlace(row: EventRow, p: EventPlace) {
  await q(`UPDATE mobile_events SET lat=$1, lng=$2, place_id=$3, directions=$4 WHERE id=$5`, [p.lat, p.lng, p.placeId, p.directions, row.id]);
}
/** Web'deki düzenleme ekranından türe özel ayrıntıları yazar. */
export async function setMobileDetails(row: EventRow, details: EventDetails) {
  await q(`UPDATE mobile_events SET details=$1 WHERE id=$2`, [JSON.stringify(cleanDetails(details)), row.id]);
}
/** Web'deki düzenleme ekranından tasarımı değiştirir. Boş tema, fotoğraflı kapağa dönmek demektir. */
export async function setMobileDesign(row: EventRow, design: EventDesign) {
  await q(`UPDATE mobile_events SET theme=$1, font=$2, ornament=$3, pattern=$4 WHERE id=$5`, [design.theme, design.font, design.ornament, design.pattern ?? "", row.id]);
}
export async function createMobileGuest(row: EventRow, body: unknown, origin: string) {
  const data = validateGuest(body);
  const guests = await q<{ count: number }>(`SELECT count(*)::int AS count FROM mobile_guests WHERE event_id=$1`, [row.id]);
  if (guests[0].count >= 2000) throw new MobileError("Bir etkinliğe en fazla 2000 davetli eklenebilir.");
  const guest = (await q<GuestRow>(`INSERT INTO mobile_guests (id,event_id,name,token,status,count,note,responded_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $5='pending' THEN NULL ELSE now() END) RETURNING *`,
    [id(),row.id,data.name,token(24),data.status,data.count,data.note]))[0];
  return guestFields(guest, row, origin);
}
export async function editMobileGuest(row: EventRow, guestId: string, body: unknown, origin: string) {
  const guest = (await q<GuestRow>(`SELECT * FROM mobile_guests WHERE event_id=$1 AND id=$2`, [row.id, guestId]))[0];
  if (!guest) throw new MobileError("Davetli bulunamadı.", 404);
  const data = validateGuest(body, guest);
  const updated = (await q<GuestRow>(`UPDATE mobile_guests SET name=$1,status=$2,count=$3,note=$4,
    responded_at=CASE WHEN $2='pending' THEN NULL ELSE now() END WHERE event_id=$5 AND id=$6 RETURNING *`,
    [data.name,data.status,data.count,data.note,row.id,guest.id]))[0];
  return guestFields(updated,row,origin);
}
export async function respondMobile(row: EventRow, body: unknown, origin: string) {
  const b = body as Record<string, unknown>;
  const data = validateGuest(body, undefined, true);
  if (b.guestToken != null) {
    if (typeof b.guestToken !== "string" || !TOKEN.test(b.guestToken)) throw new MobileError("Davetli bağlantısı geçersiz.", 404);
    const guest = (await q<GuestRow>(`SELECT * FROM mobile_guests WHERE event_id=$1 AND token=$2`, [row.id,b.guestToken]))[0];
    if (!guest) throw new MobileError("Davetli bağlantısı geçersiz.", 404);
    return editMobileGuest(row,guest.id,data,origin);
  }
  return createMobileGuest(row,data,origin);
}
/** Yanlış eklenen davetliyi siler. Web panelinden kullanılır; uygulamanın kendi akışında yok. */
export async function removeMobileGuest(row: { id: string }, guestId: string) {
  const gone = await q(`DELETE FROM mobile_guests WHERE event_id=$1 AND id=$2 RETURNING id`, [row.id, guestId]);
  if (!gone.length) throw new MobileError("Davetli bulunamadı.", 404);
}

/** Etkinlik paneli için sayım. "Belki" diyenler ayrı tutulur, toplama katılmaz. */
export function mobileSummary(guests: { status: MobileStatus; count: number }[]) {
  const by = (s: MobileStatus) => guests.filter((g) => g.status === s);
  const going = by("going");
  const waiting = by("pending").length;
  return {
    people: going.reduce((sum, g) => sum + g.count, 0),
    going: going.length,
    maybe: by("maybe").length,
    declined: by("declined").length,
    waiting,
    invites: guests.length,
    answeredPct: guests.length ? Math.round(((guests.length - waiting) / guests.length) * 100) : 0,
  };
}

export const MOBILE_STATUS_LABEL: Record<MobileStatus, string> = {
  going: "Geliyor", maybe: "Belki", declined: "Gelemiyor", pending: "Bekliyor",
};

/** Ev sahibinin isteğiyle davet, davetliler ve plan verileri kalıcı silinir (bağlı tablolar CASCADE). */
export async function deleteMobileEvent(row: EventRow) {
  await q(`DELETE FROM mobile_events WHERE id=$1`, [row.id]);
}

export async function cleanupMobileExpired(today: string) {
  await mobileReady();
  const rows = await q(`DELETE FROM mobile_events WHERE delete_after < $1 RETURNING id`,[today]);
  return rows.length;
}

export function mobileOrigin(req: Request) {
  const url = new URL(req.url);
  // Next dev can normalize request.url to localhost; preserve the actual LAN host
  // used by the phone so invitation links return to the same running server.
  const host = req.headers.get("host");
  if (host && !/[\s\/@?#]/.test(host)) {
    try { const origin = new URL(`${url.protocol}//${host}`); if (origin.host === host) return origin.origin; } catch {}
  }
  return url.origin;
}
const RESPONSE_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
export const mobileJson = (body: unknown, status = 200) => Response.json(body, {status, headers: RESPONSE_HEADERS});
export const mobileOptions = () => new Response(null, { status: 204, headers: RESPONSE_HEADERS });
export async function readMobileBody(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json")) throw new MobileError("JSON biçiminde gönder.", 415);
  const maxBytes = 3_200_000;
  if (Number(req.headers.get("content-length")) > maxBytes) throw new MobileError("Gönderilen bilgi çok uzun.", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new MobileError("Gönderilen bilgi okunamadı.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    bytes += result.value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      throw new MobileError("Görsel çok büyük. Daha küçük bir görsel seç.", 413);
    }
    chunks.push(result.value);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return JSON.parse(raw) as unknown; } catch { throw new MobileError("Gönderilen bilgi okunamadı."); }
}
export async function mobileHandler(action: () => Promise<Response>) {
  try { return await action(); }
  catch (error) {
    if (error instanceof MobileError) return mobileJson({error:error.message},error.status);
    console.error("Mobile API request failed", error instanceof Error ? error.name : "unknown");
    return mobileJson({error:"İşlem tamamlanamadı. Biraz sonra tekrar dene."},500);
  }
}
export function requireMobileEvent(row: EventRow | null): EventRow {
  if (!row) throw new MobileError("Etkinlik bulunamadı veya bağlantının süresi doldu.",404);
  return row;
}
