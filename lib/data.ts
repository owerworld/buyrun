import { q } from "./db";
import { id, token } from "./tokens";
import { addDays } from "./format";

export type Side = "kiz" | "oglan";
export type Status = "bekliyor" | "geliyor" | "gelmiyor";

export interface Invitation {
  id: string; admin_token: string; name_a: string; name_b: string; city: string; main_date: string;
  bus_from: string; bus_time: string; bus_note: string; program: string; theme: string; delete_after: string;
}
export interface EventRow { id: string; invitation_id: string; kind: string; title: string; event_date: string; event_time: string; venue: string; address: string; sort: number; }
export interface Family { id: string; invitation_id: string; side: Side; panel_token: string; }
export interface Guest {
  id: string; invitation_id: string; family_id: string; name: string; token: string;
  event_ids: string; status: Status; count: number; attend_ids: string; note: string;
}

export const SIDE_LABEL: Record<Side, string> = { kiz: "Kız evi", oglan: "Oğlan evi" };
export const list = (s: string) => (s ? s.split(",").filter(Boolean) : []);

export interface NewEvent { kind: string; title: string; date: string; time: string; venue: string; address: string; }
export interface NewInvitation {
  nameA: string; nameB: string; city: string;
  events: NewEvent[]; busFrom: string; busTime: string; busNote: string; program: string; theme: string;
}

/** Veri saklama kuralı: son etkinlikten 90 gün sonra her şey silinir. */
export const RETENTION_DAYS = 90;

export async function createInvitation(input: NewInvitation) {
  const inv = id();
  const admin = token(16);
  const dates = input.events.map((e) => e.date).sort();
  const mainDate = input.events.find((e) => e.kind === "dugun")?.date ?? dates[0];
  const deleteAfter = addDays(dates[dates.length - 1], RETENTION_DAYS);

  await q(
    `INSERT INTO invitations (id, admin_token, name_a, name_b, city, main_date, bus_from, bus_time, bus_note, program, theme, delete_after)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [inv, admin, input.nameA, input.nameB, input.city, mainDate, input.busFrom, input.busTime, input.busNote, input.program, input.theme, deleteAfter]
  );
  let i = 0;
  for (const e of input.events) {
    await q(
      `INSERT INTO events (id, invitation_id, kind, title, event_date, event_time, venue, address, sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id(), inv, e.kind, e.title, e.date, e.time, e.venue, e.address, i++]
    );
  }
  for (const side of ["kiz", "oglan"] as Side[]) {
    await q(`INSERT INTO families (id, invitation_id, side, panel_token) VALUES ($1,$2,$3,$4)`, [id(), inv, side, token(12)]);
  }
  return admin;
}

export interface EditEvent { id: string; date: string; time: string; venue: string; address: string; }
export interface EditInvitation {
  nameA: string; nameB: string; city: string;
  events: EditEvent[]; busFrom: string; busTime: string; busNote: string; program: string; theme: string;
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
      `UPDATE events SET event_date = $1, event_time = $2, venue = $3, address = $4 WHERE id = $5 AND invitation_id = $6`,
      [e.date, e.time, e.venue, e.address, e.id, inv.id]
    );
  }

  // Tarihler değiştiyse ana tarih ve silme tarihi yeniden hesaplanır
  const after = events.map((e) => edits.find((x) => x.id === e.id)?.date ?? e.event_date).sort();
  const wedding = events.find((e) => e.kind === "dugun");
  const mainDate = (wedding && edits.find((x) => x.id === wedding.id)?.date) ?? wedding?.event_date ?? after[0];
  const deleteAfter = addDays(after[after.length - 1], RETENTION_DAYS);

  await q(
    `UPDATE invitations SET name_a = $1, name_b = $2, city = $3, main_date = $4,
       bus_from = $5, bus_time = $6, bus_note = $7, program = $8, theme = $9, delete_after = $10 WHERE id = $11`,
    [input.nameA, input.nameB, input.city, mainDate, input.busFrom, input.busTime, input.busNote, input.program, input.theme, deleteAfter, inv.id]
  );
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

/** Saklama süresi dolan davetiyeleri (ve bağlı tüm verileri) siler. */
export async function cleanupExpired(today: string) {
  const rows = await q<{ id: string }>(`DELETE FROM invitations WHERE delete_after < $1 RETURNING id`, [today]);
  return rows.length;
}

/** Ortak sayım: iki ailenin toplamı. */
export function summarize(guests: Guest[], events: EventRow[]) {
  const coming = guests.filter((g) => g.status === "geliyor");
  return {
    people: coming.reduce((s, g) => s + g.count, 0),
    comingInvites: coming.length,
    declined: guests.filter((g) => g.status === "gelmiyor").length,
    waiting: guests.filter((g) => g.status === "bekliyor").length,
    perEvent: events.map((e) => ({
      id: e.id, title: e.title, kind: e.kind,
      people: coming.filter((g) => list(g.attend_ids).includes(e.id)).reduce((s, g) => s + g.count, 0),
    })),
  };
}

/** Davetin kısa adı: "Kına ve düğün daveti" gibi. Link önizlemesinde kullanılır. */
export function inviteLabel(events: { kind: string }[]) {
  const kinds = events.map((e) => e.kind);
  const kina = kinds.includes("kina");
  const dugun = kinds.includes("dugun");
  if (kina && dugun) return "Kına ve düğün daveti";
  if (kina) return "Kına daveti";
  if (dugun) return "Düğün daveti";
  return "Davet";
}
