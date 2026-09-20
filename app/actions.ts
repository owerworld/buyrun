"use server";

import { redirect } from "next/navigation";
import { addGuest, createInvitation, getAdmin, removeGuest, respond, updateInvitation, type EditEvent, type NewEvent, type Status } from "@/lib/data";
import { todayIso } from "@/lib/format";
import { DEFAULT_THEME, isTheme } from "@/lib/themes";

const s = (f: FormData, k: string, max = 120) => String(f.get(k) ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: string) => /^\d{2}:\d{2}$/.test(v);
const theme = (f: FormData) => { const t = s(f, "theme", 20); return isTheme(t) ? t : DEFAULT_THEME; };

export async function createAction(f: FormData) {
  const fail = (m: string) => redirect(`/olustur?hata=${encodeURIComponent(m)}`);
  const nameA = s(f, "nameA", 40), nameB = s(f, "nameB", 40);
  if (!nameA || !nameB) fail("Çiftin iki adını da yazın.");
  if (f.get("kvkk") !== "on") fail("Devam etmek için aydınlatma metnini onaylayın.");

  const events: NewEvent[] = [];
  const wedding = { date: s(f, "d_date"), time: s(f, "d_time"), venue: s(f, "d_venue"), address: s(f, "d_address") };
  if (!isDate(wedding.date) || !isTime(wedding.time) || !wedding.venue) fail("Düğün tarihi, saati ve salonu zorunlu.");
  if (wedding.date < todayIso()) fail("Düğün tarihi geçmişte olamaz.");
  events.push({ kind: "dugun", title: "Nikâh ve Düğün", ...wedding });

  if (f.get("hasKina") === "on") {
    const kina = { date: s(f, "k_date"), time: s(f, "k_time"), venue: s(f, "k_venue"), address: s(f, "k_address") };
    if (!isDate(kina.date) || !isTime(kina.time) || !kina.venue) fail("Kına için tarih, saat ve yer zorunlu.");
    events.unshift({ kind: "kina", title: "Kına Gecesi", ...kina });
  }

  const admin = await createInvitation({
    nameA, nameB, city: s(f, "city", 40), events,
    busFrom: s(f, "busFrom"), busTime: isTime(s(f, "busTime")) ? s(f, "busTime") : "", busNote: s(f, "busNote", 160),
    program: s(f, "program", 600), theme: theme(f),
  });
  redirect(`/yonet/${admin}`);
}

export async function updateInvitationAction(adminToken: string, f: FormData) {
  const fail = (m: string) => redirect(`/yonet/${adminToken}/duzenle?hata=${encodeURIComponent(m)}`);
  const data = await getAdmin(adminToken);
  if (!data) redirect("/");

  const nameA = s(f, "nameA", 40), nameB = s(f, "nameB", 40);
  if (!nameA || !nameB) fail("Çiftin iki adını da yazın.");

  const events: EditEvent[] = [];
  for (const e of data.events) {
    const ev = {
      id: e.id,
      date: s(f, `e_${e.id}_date`),
      time: s(f, `e_${e.id}_time`),
      venue: s(f, `e_${e.id}_venue`, 80),
      address: s(f, `e_${e.id}_address`),
    };
    if (!isDate(ev.date) || !isTime(ev.time) || !ev.venue) fail(`${e.title} için tarih, saat ve yer zorunlu.`);
    // Tarihi değiştiriyorsa geçmişe alamaz; dokunmadıysa eski tarih olduğu gibi kalır
    if (ev.date !== e.event_date && ev.date < todayIso()) fail(`${e.title} tarihi geçmişte olamaz.`);
    events.push(ev);
  }

  await updateInvitation(adminToken, {
    nameA, nameB, city: s(f, "city", 40), events,
    busFrom: s(f, "busFrom"), busTime: isTime(s(f, "busTime")) ? s(f, "busTime") : "", busNote: s(f, "busNote", 160),
    program: s(f, "program", 600), theme: theme(f),
  });
  redirect(`/yonet/${adminToken}?guncellendi=1`);
}

export async function addGuestAction(panelToken: string, f: FormData) {
  const name = s(f, "name", 60);
  const ev = f.getAll("ev").map(String);
  if (!name) redirect(`/p/${panelToken}?hata=${encodeURIComponent("Davetlinin adını yazın.")}#ekle`);
  if (!ev.length) redirect(`/p/${panelToken}?hata=${encodeURIComponent("En az bir gün seçin.")}#ekle`);
  const t = await addGuest(panelToken, name, ev);
  redirect(`/p/${panelToken}?yeni=${t}`);
}

export async function removeGuestAction(panelToken: string, guestId: string) {
  await removeGuest(panelToken, guestId);
  redirect(`/p/${panelToken}`);
}

export async function respondAction(guestToken: string, f: FormData) {
  const status = s(f, "status") as Status;
  if (status !== "geliyor" && status !== "gelmiyor") redirect(`/d/${guestToken}?duzenle=1&hata=${encodeURIComponent("Geliyorum ya da Gelemiyorum seçin.")}`);
  try {
    await respond(guestToken, { status, count: Number(f.get("count") || 1), attend: f.getAll("attend").map(String), note: s(f, "note", 200) });
  } catch (e) {
    redirect(`/d/${guestToken}?duzenle=1&hata=${encodeURIComponent((e as Error).message)}`);
  }
  redirect(`/d/${guestToken}?tamam=1`);
}
