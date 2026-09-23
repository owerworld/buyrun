"use server";

import { redirect } from "next/navigation";
import {
  createMobileEvent, createMobileGuest, editMobileEvent, editMobileGuest, eventInput,
  designOf, mobileEventByToken, MobileError, removeMobileGuest, setMobileDesign, validateEvent,
} from "@/lib/mobile";
import { isFont, isOrnament } from "@/lib/design";
import { isTheme } from "@/lib/themes";
import { placeFromForm } from "@/lib/places";
import { setMobilePlace } from "@/lib/mobile";
import { siteUrl } from "@/lib/format";
import { allow } from "@/lib/ratelimit";

const s = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const sayi = (f: FormData, k: string) => {
  const v = s(f, k, 8);
  return v ? Number(v) : null;
};
/** Formdaki alanları mobil API'nin beklediği biçime çevirir. Web'de kapak fotoğrafı yüklenmez. */
const formEvent = (f: FormData) => ({
  title: s(f, "title", 100), category: s(f, "category", 40), hostName: s(f, "hostName", 80),
  date: s(f, "date", 10), time: s(f, "time", 5), venue: s(f, "venue", 160),
  address: s(f, "address", 400), description: s(f, "description", 2000),
  coverId: s(f, "coverId", 64), capacity: sayi(f, "capacity"), coverData: null,
});
const mesaj = (e: unknown) => (e instanceof MobileError ? e.message : "İşlem tamamlanamadı, tekrar deneyin.");

export async function createEventAction(f: FormData) {
  const fail = (m: string) => redirect(`/etkinlik?hata=${encodeURIComponent(m)}`);
  if (f.get("kvkk") !== "on") fail("Devam etmek için aydınlatma metnini onaylayın.");
  if (!(await allow("mobile-create", 20, 3600)))
    fail("Kısa sürede çok fazla etkinlik oluşturuldu. Bir saat sonra tekrar deneyin.");

  let token = "";
  try {
    const event = await createMobileEvent(validateEvent(formEvent(f)), siteUrl(), undefined, placeFromForm(f, ""));
    token = event.manageToken;
  } catch (e) {
    fail(mesaj(e));
  }
  redirect(`/etkinlik/${token}?yeni=1`);
}

export async function updateEventAction(manageToken: string, f: FormData) {
  const fail = (m: string) => redirect(`/etkinlik/${manageToken}/duzenle?hata=${encodeURIComponent(m)}`);
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) redirect("/etkinlik");
  if (!(await allow(`mobile-edit:${row.id}`, 120, 3600))) fail("Çok fazla düzenleme yapıldı. Biraz sonra deneyin.");
  try {
    await editMobileEvent(row, validateEvent(formEvent(f), eventInput(row)), siteUrl());
    await setMobilePlace(row, placeFromForm(f, ""));
    // Tasarımlı davette seçiciler formda; geçersiz değer gelirse eski tasarım korunur
    const design = designOf(row);
    if (design) {
      const theme = s(f, "theme", 20), font = s(f, "font", 20), ornament = s(f, "ornament", 20);
      await setMobileDesign(row, {
        theme: isTheme(theme) ? theme : design.theme,
        font: isFont(font) ? font : design.font,
        ornament: isOrnament(ornament) ? ornament : design.ornament,
      });
    }
  } catch (e) {
    fail(mesaj(e));
  }
  redirect(`/etkinlik/${manageToken}?guncellendi=1`);
}

export async function addEventGuestAction(manageToken: string, f: FormData) {
  const fail = (m: string) => redirect(`/etkinlik/${manageToken}?bolum=ekle&hata=${encodeURIComponent(m)}`);
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) redirect("/etkinlik");
  if (!(await allow(`mobile-add:${row.id}`, 200, 3600))) fail("Davetli eklemek için biraz bekleyin.");

  let guestToken = "";
  try {
    const guest = await createMobileGuest(row, { name: s(f, "name", 100), status: "pending", count: 1 }, siteUrl());
    guestToken = guest.token;
  } catch (e) {
    fail(mesaj(e));
  }
  redirect(`/etkinlik/${manageToken}?yeniDavetli=${guestToken}`);
}

/** Ev sahibi, telefonla haber veren davetlinin yanıtını kendi elleriyle işler. */
export async function setEventGuestAction(manageToken: string, guestId: string, f: FormData) {
  const fail = (m: string) => redirect(`/etkinlik/${manageToken}?hata=${encodeURIComponent(m)}`);
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) redirect("/etkinlik");
  if (!(await allow(`mobile-response:${row.id}`, 300, 3600))) fail("Çok fazla değişiklik yapıldı. Biraz sonra deneyin.");
  try {
    await editMobileGuest(row, guestId, { name: s(f, "name", 100), status: s(f, "status", 20), count: sayi(f, "count") ?? 1, note: s(f, "note", 500) }, siteUrl());
  } catch (e) {
    fail(mesaj(e));
  }
  redirect(`/etkinlik/${manageToken}?guncellendi=1`);
}

export async function removeEventGuestAction(manageToken: string, guestId: string, f: FormData) {
  const fail = (m: string) => redirect(`/etkinlik/${manageToken}?hata=${encodeURIComponent(m)}`);
  if (f.get("silOnay") !== "on") fail("Silmek için onay kutusunu işaretleyin.");
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) redirect("/etkinlik");
  try {
    await removeMobileGuest(row, guestId);
  } catch (e) {
    fail(mesaj(e));
  }
  redirect(`/etkinlik/${manageToken}`);
}
