import { q } from "./db";
import { id, recoveryCode, token } from "./tokens";
import { addDays } from "./format";
import { extraOf, isExtraKind, kindOf, mainOf } from "./events";

export type Side = "kiz" | "oglan";
export type Status = "bekliyor" | "geliyor" | "gelmiyor";

export interface Invitation {
  id: string; admin_token: string; name_a: string; name_b: string; city: string; main_date: string;
  bus_from: string; bus_time: string; bus_note: string; program: string; extra_program: string; message: string; theme: string;
  font: string; ornament: string; opening: string; family_a: string; family_b: string;
  bus_lat: number | null; bus_lng: number | null; bus_place: string; recovery_code: string; delete_after: string;
}
export interface EventRow {
  id: string; invitation_id: string; kind: string; title: string; event_date: string; event_time: string; venue: string; address: string; sort: number;
  lat: number | null; lng: number | null; place_id: string; directions: string;
}
/** Mekân seçicinin getirdiği konum. Koordinat yoksa yol tarifi yer adıyla aranır. */
export interface PlaceInput { lat?: number | null; lng?: number | null; placeId?: string; directions?: string }
export interface Family { id: string; invitation_id: string; side: Side; panel_token: string; }
export interface Guest {
  id: string; invitation_id: string; family_id: string; name: string; token: string;
  event_ids: string; status: Status; count: number; attend_ids: string; note: string;
}

export const SIDE_LABEL: Record<Side, string> = { kiz: "Kız evi", oglan: "Oğlan evi" };
export const list = (s: string) => (s ? s.split(",").filter(Boolean) : []);

export interface NewEvent extends PlaceInput { kind: string; title: string; date: string; time: string; venue: string; address: string; }
export interface NewInvitation {
  nameA: string; nameB: string; city: string;
  events: NewEvent[]; busFrom: string; busTime: string; busNote: string; program: string; extraProgram: string; theme: string;
  /** Sihirbazın yazdığı davet metni. Boşsa davetiye eskisi gibi hazır cümleyi kullanır. */
  message?: string;
  /** Tasarım eksenleri (lib/design.ts). Boşsa klasik görünüm. */
  font?: string; ornament?: string;
  /** Kapağın üst satırı ("Allah'ın izniyle"); boşsa varsayılan cümle */
  opening?: string;
  /** İki ailenin adı; boşsa davetiyede aile satırı çıkmaz */
  familyA?: string; familyB?: string;
  /** Servis kalkış yerinin konumu */
  bus?: PlaceInput;
}

/** Veri saklama kuralı: son etkinlikten 90 gün sonra her şey silinir. */
export const RETENTION_DAYS = 90;

export async function createInvitation(input: NewInvitation) {
  const inv = id();
  const admin = token(16);
  const recovery = recoveryCode();
  const dates = input.events.map((e) => e.date).sort();
  const mainDate = input.events.find((e) => !isExtraKind(e.kind))?.date ?? dates[0];
  const deleteAfter = addDays(dates[dates.length - 1], RETENTION_DAYS);

  await q(
    `INSERT INTO invitations (id, admin_token, name_a, name_b, city, main_date, bus_from, bus_time, bus_note, program, extra_program, message, theme, font, ornament, opening, family_a, family_b, recovery_code, delete_after)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
    [inv, admin, input.nameA, input.nameB, input.city, mainDate, input.busFrom, input.busTime, input.busNote, input.program, input.extraProgram, input.message ?? "", input.theme, input.font || "klasik", input.ornament || "sirma",
     input.opening ?? "", input.familyA ?? "", input.familyB ?? "", recovery, deleteAfter]
  );
  if (input.bus) await setBusPlace(inv, input.bus);
  let i = 0;
  for (const e of input.events) {
    await q(
      `INSERT INTO events (id, invitation_id, kind, title, event_date, event_time, venue, address, sort, lat, lng, place_id, directions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id(), inv, e.kind, e.title, e.date, e.time, e.venue, e.address, i++, e.lat ?? null, e.lng ?? null, e.placeId ?? "", e.directions ?? ""]
    );
  }
  for (const side of ["kiz", "oglan"] as Side[]) {
    await q(`INSERT INTO families (id, invitation_id, side, panel_token) VALUES ($1,$2,$3,$4)`, [id(), inv, side, token(12)]);
  }
  return admin;
}

export interface EditEvent extends PlaceInput { id: string; date: string; time: string; venue: string; address: string; }
export interface EditInvitation {
  nameA: string; nameB: string; city: string;
  events: EditEvent[]; busFrom: string; busTime: string; busNote: string; program: string; extraProgram: string; theme: string;
  message?: string; font?: string; ornament?: string;
  opening?: string; familyA?: string; familyB?: string;
  /** Servis kalkış yerinin konumu */
  bus?: PlaceInput;
}

/** Çift davetiyesini sonradan düzenler. Etkinlikler yerinde güncellenir, davetli linkleri bozulmaz. */
export async function updateInvitation(adminToken: string, input: EditInvitation) {
  const data = await getAdmin(adminToken);
  if (!data) throw new Error("Davetiye bulunamadı");
  const { inv, events } = data;

  // Yalnızca bu davetiyeye ait etkinlikler güncellenebilir
  const edits = input.events.filter((e) => events.some((x) => x.id === e.id));
  for (const e of edits) {
    await q(
      `UPDATE events SET event_date = $1, event_time = $2, venue = $3, address = $4,
         lat = $5, lng = $6, place_id = $7, directions = $8 WHERE id = $9 AND invitation_id = $10`,
      [e.date, e.time, e.venue, e.address, e.lat ?? null, e.lng ?? null, e.placeId ?? "", e.directions ?? "", e.id, inv.id]
    );
  }

  // Tarihler değiştiyse ana tarih ve silme tarihi yeniden hesaplanır
  const after = events.map((e) => edits.find((x) => x.id === e.id)?.date ?? e.event_date).sort();
  const wedding = mainOf(events);
  const mainDate = (wedding && edits.find((x) => x.id === wedding.id)?.date) ?? wedding?.event_date ?? after[0];
  const deleteAfter = addDays(after[after.length - 1], RETENTION_DAYS);

  await q(
    `UPDATE invitations SET name_a = $1, name_b = $2, city = $3, main_date = $4,
       bus_from = $5, bus_time = $6, bus_note = $7, program = $8, extra_program = $9, theme = $10,
       message = $11, font = $12, ornament = $13, opening = $14, family_a = $15, family_b = $16, delete_after = $17 WHERE id = $18`,
    [input.nameA, input.nameB, input.city, mainDate, input.busFrom, input.busTime, input.busNote, input.program, input.extraProgram, input.theme,
     input.message ?? inv.message ?? "", input.font || inv.font || "klasik", input.ornament || inv.ornament || "sirma",
     input.opening ?? inv.opening ?? "", input.familyA ?? inv.family_a ?? "", input.familyB ?? inv.family_b ?? "", deleteAfter, inv.id]
  );
  if (input.bus) await setBusPlace(inv.id, input.bus);
}

/** Servis kalkış yerinin konumu; kalkış yeri silinirse konum da silinir. */
async function setBusPlace(invId: string, p: PlaceInput) {
  await q(`UPDATE invitations SET bus_lat = $1, bus_lng = $2, bus_place = $3 WHERE id = $4`, [p.lat ?? null, p.lng ?? null, p.placeId ?? "", invId]);
}

async function eventsOf(invId: string) {
  return q<EventRow>(`SELECT * FROM events WHERE invitation_id = $1 ORDER BY event_date, sort`, [invId]);
}

export async function getAdmin(adminToken: string) {
  const [inv] = await q<Invitation>(`SELECT * FROM invitations WHERE admin_token = $1`, [adminToken]);
  if (!inv) return null;
  const families = await q<Family>(`SELECT * FROM families WHERE invitation_id = $1 ORDER BY side DESC`, [inv.id]);
  const guests = await q<Guest>(`SELECT * FROM guests WHERE invitation_id = $1`, [inv.id]);
  return { inv, events: await eventsOf(inv.id), families, guests };
}

/**
 * Yönetim linkini kaybeden çift için kurtarma kodu.
 * Kod, davetiye oluşturulurken üretilir; eski kayıtlarda boşsa ilk açılışta tamamlanır.
 */
export async function ensureRecoveryCode(adminToken: string) {
  const [inv] = await q<Invitation>(`SELECT * FROM invitations WHERE admin_token = $1`, [adminToken]);
  if (!inv) return "";
  if (inv.recovery_code) return inv.recovery_code;
  const code = recoveryCode();
  await q(`UPDATE invitations SET recovery_code = $1 WHERE id = $2 AND recovery_code = ''`, [code, inv.id]);
  const [fresh] = await q<Invitation>(`SELECT recovery_code FROM invitations WHERE id = $1`, [inv.id]);
  return fresh?.recovery_code ?? code;
}

/** Kurtarma kodundan yönetim linkini bulur. Kod yanlışsa null döner. */
export async function adminTokenByRecoveryCode(code: string) {
  if (!code) return null;
  const [inv] = await q<{ admin_token: string }>(
    `SELECT admin_token FROM invitations WHERE recovery_code = $1`, [code]
  );
  return inv?.admin_token ?? null;
}

export async function getPanel(panelToken: string) {
  const [family] = await q<Family>(`SELECT * FROM families WHERE panel_token = $1`, [panelToken]);
  if (!family) return null;
  const [inv] = await q<Invitation>(`SELECT * FROM invitations WHERE id = $1`, [family.invitation_id]);
  const guests = await q<Guest>(`SELECT * FROM guests WHERE invitation_id = $1 ORDER BY created_at`, [inv.id]);
  return { inv, family, events: await eventsOf(inv.id), guests };
}

export async function addGuest(panelToken: string, name: string, eventIds: string[]) {
  const panel = await getPanel(panelToken);
  if (!panel) throw new Error("Panel bulunamadı");
  const valid = eventIds.filter((e) => panel.events.some((x) => x.id === e));
  if (!valid.length) throw new Error("Etkinlik seçilmedi");
  const t = token(12);
  await q(
    `INSERT INTO guests (id, invitation_id, family_id, name, token, event_ids) VALUES ($1,$2,$3,$4,$5,$6)`,
    [id(), panel.inv.id, panel.family.id, name, t, valid.join(",")]
  );
  return t;
}

/**
 * Davetlinin adını ve çağrıldığı günleri değiştirir. Linki ve verdiği yanıt korunur.
 * Artık davetli olmadığı günler katılım kaydından da düşer; geliyorum dediği
 * tek gün elinden alınırsa yanıt "bekliyor"a döner ki aile tekrar sorabilsin.
 */
export async function updateGuest(panelToken: string, guestId: string, name: string, eventIds: string[]) {
  const panel = await getPanel(panelToken);
  if (!panel) throw new Error("Panel bulunamadı");
  const guest = panel.guests.find((g) => g.id === guestId && g.family_id === panel.family.id);
  if (!guest) throw new Error("Davetli bulunamadı");

  if (!name) throw new Error("Davetlinin adını yazın");
  const valid = panel.events.filter((e) => eventIds.includes(e.id)).map((e) => e.id);
  if (!valid.length) throw new Error("En az bir gün seçin");

  const attend = list(guest.attend_ids).filter((a) => valid.includes(a));
  const sifirla = guest.status === "geliyor" && attend.length === 0;

  await q(
    `UPDATE guests SET name = $1, event_ids = $2, attend_ids = $3, status = $4, count = $5 WHERE id = $6 AND family_id = $7`,
    [name, valid.join(","), attend.join(","), sifirla ? "bekliyor" : guest.status, sifirla ? 1 : guest.count, guestId, panel.family.id]
  );
  return sifirla;
}

export async function removeGuest(panelToken: string, guestId: string) {
  const panel = await getPanel(panelToken);
  if (!panel) return;
  await q(`DELETE FROM guests WHERE id = $1 AND family_id = $2`, [guestId, panel.family.id]);
}

export async function getGuest(guestToken: string) {
  const [guest] = await q<Guest>(`SELECT * FROM guests WHERE token = $1`, [guestToken]);
  if (!guest) return null;
  const [inv] = await q<Invitation>(`SELECT * FROM invitations WHERE id = $1`, [guest.invitation_id]);
  const all = await eventsOf(inv.id);
  const ids = list(guest.event_ids);
  return { guest, inv, events: all.filter((e) => ids.includes(e.id)) };
}

export async function respond(guestToken: string, r: { status: Status; count: number; attend: string[]; note: string }) {
  const data = await getGuest(guestToken);
  if (!data) throw new Error("Davet bulunamadı");
  const allowed = data.events.map((e) => e.id);
  const attend = r.status === "geliyor" ? (allowed.length === 1 ? allowed : r.attend.filter((a) => allowed.includes(a))) : [];
  if (r.status === "geliyor" && !attend.length) throw new Error("En az bir etkinlik seçin");
  const count = r.status === "geliyor" ? Math.min(Math.max(1, Math.floor(r.count || 1)), 15) : 0;
  await q(
    `UPDATE guests SET status = $1, count = $2, attend_ids = $3, note = $4, responded_at = now() WHERE token = $5`,
    [r.status, count, attend.join(","), r.note.slice(0, 200), guestToken]
  );
}

/** Etkinlik tarihleri değiştiğinde ana tarih ve silme tarihi yeniden hesaplanır. */
async function refreshDates(invId: string) {
  const events = await eventsOf(invId);
  if (!events.length) return;
  const dates = events.map((e) => e.event_date).sort();
  const mainDate = mainOf(events)?.event_date ?? dates[0];
  await q(`UPDATE invitations SET main_date = $1, delete_after = $2 WHERE id = $3`, [
    mainDate, addDays(dates[dates.length - 1], RETENTION_DAYS), invId,
  ]);
}

/** İkinci etkinliği (kına ya da after party) sonradan ekler. */
export async function addExtraEvent(adminToken: string, e: NewEvent, inviteExisting: boolean, program = "") {
  const data = await getAdmin(adminToken);
  if (!data) throw new Error("Davetiye bulunamadı");
  if (extraOf(data.events)) throw new Error("Bu davetiyede zaten ikinci bir etkinlik var.");

  const eventId = id();
  await q(
    `INSERT INTO events (id, invitation_id, kind, title, event_date, event_time, venue, address, sort, lat, lng, place_id, directions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10,$11,$12)`,
    [eventId, data.inv.id, e.kind, kindOf(e.kind).title, e.date, e.time, e.venue, e.address, e.lat ?? null, e.lng ?? null, e.placeId ?? "", e.directions ?? ""]
  );
  await q(`UPDATE invitations SET extra_program = $1 WHERE id = $2`, [program, data.inv.id]);
  if (inviteExisting) {
    await q(`UPDATE guests SET event_ids = event_ids || $1 WHERE invitation_id = $2`, [`,${eventId}`, data.inv.id]);
  }
  await refreshDates(data.inv.id);
}

/** Yalnızca bu etkinliğe çağrılmış davetliler. Etkinlik kaldırılmadan önce kontrol edilir. */
export function onlyGuestsOf(guests: Guest[], eventId: string) {
  return guests.filter((g) => { const ids = list(g.event_ids); return ids.length === 1 && ids[0] === eventId; });
}

/** İkinci etkinliği kaldırır ve davetlilerin kayıtlarından bu günü temizler. */
export async function removeExtraEvent(adminToken: string) {
  const data = await getAdmin(adminToken);
  if (!data) throw new Error("Davetiye bulunamadı");
  const extra = extraOf(data.events);
  if (!extra) throw new Error("Bu davetiyede ikinci bir etkinlik yok.");

  const yalniz = onlyGuestsOf(data.guests, extra.id);
  if (yalniz.length) {
    throw new Error(
      `${yalniz.length} davetli yalnızca "${extra.title}" etkinliğine çağrılmış. Kaldırmadan önce ailelerin bu kişileri panelden silmesi gerekiyor.`
    );
  }

  // Davetlilerin gün listelerinden bu etkinliği çıkar
  for (const g of data.guests) {
    const ev = list(g.event_ids).filter((i) => i !== extra.id).join(",");
    const at = list(g.attend_ids).filter((i) => i !== extra.id).join(",");
    if (ev !== g.event_ids || at !== g.attend_ids) {
      await q(`UPDATE guests SET event_ids = $1, attend_ids = $2 WHERE id = $3`, [ev, at, g.id]);
    }
  }
  await q(`DELETE FROM events WHERE id = $1 AND invitation_id = $2`, [extra.id, data.inv.id]);
  await q(`UPDATE invitations SET extra_program = '' WHERE id = $1`, [data.inv.id]);
  await refreshDates(data.inv.id);
}

/** Saklama süresi dolan davetiyeleri (ve bağlı tüm verileri) siler. */
export async function cleanupExpired(today: string) {
  const rows = await q<{ id: string }>(`DELETE FROM invitations WHERE delete_after < $1 RETURNING id`, [today]);
  return rows.length;
}

/** Ortak sayım: iki ailenin toplamı. */
export function summarize(guests: Guest[], events: EventRow[]) {
  const coming = guests.filter((g) => g.status === "geliyor");
  const waiting = guests.filter((g) => g.status === "bekliyor").length;
  const answered = guests.length - waiting;
  return {
    people: coming.reduce((s, g) => s + g.count, 0),
    comingInvites: coming.length,
    declined: guests.filter((g) => g.status === "gelmiyor").length,
    waiting,
    invites: guests.length,
    /** Yanıt oranı: kaç davetin cevabı geldi. Yüzde olarak, yuvarlanmış. */
    answeredPct: guests.length ? Math.round((answered / guests.length) * 100) : 0,
    perEvent: events.map((e) => ({
      id: e.id, title: e.title, kind: e.kind,
      people: coming.filter((g) => list(g.attend_ids).includes(e.id)).reduce((s, g) => s + g.count, 0),
    })),
  };
}
