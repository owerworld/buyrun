"use server";

import { redirect } from "next/navigation";
import { writeInvitationText } from "@/lib/ai";
import { createInvitation, type NewEvent } from "@/lib/data";
import { greetingFor, kindOf } from "@/lib/events";
import { longDate, siteUrl, todayIso } from "@/lib/format";
import { createMobileEvent, MobileError, validateEvent } from "@/lib/mobile";
import { placeFromForm } from "@/lib/places";
import { allow, LIMITS } from "@/lib/ratelimit";
import { answersQuery, parseAnswers, planFromAnswers } from "@/lib/wizard";

const s = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/**
 * Sihirbazın sonu: cevaplar + yazılı bilgiler birleşir, davet metni yazılır, davet kurulur.
 *
 * Tören dalı düğün davetiyesini (iki aile paneli), diğer dal genel etkinliği kurar.
 * Metin yazımı AI'a düşse de davet oluşturma ona bağlı değil — lib/ai.ts her koşulda metin döndürür.
 */
export async function wizardAction(f: FormData) {
  // Cevaplar formda "c_" önekiyle gelir (bkz. bilgiler sayfası)
  const answers = parseAnswers(
    Object.fromEntries([...f.entries()].filter(([k]) => k.startsWith("c_")).map(([k, v]) => [k.slice(2), String(v)]))
  );
  const plan = planFromAnswers(answers);
  const geri = `/basla/bilgiler?${answersQuery(answers)}`;
  const fail = (m: string) => redirect(`${geri}&hata=${encodeURIComponent(m)}`);

  if (f.get("kvkk") !== "on") fail("Devam etmek için aydınlatma metnini onaylayın.");

  if (plan.toren) {
    if (!(await allow(LIMITS.davetiye.action, LIMITS.davetiye.limit, LIMITS.davetiye.window)))
      fail("Kısa sürede çok fazla davetiye oluşturuldu. Bir saat sonra tekrar deneyin.");

    const nameA = s(f, "nameA", 40), nameB = s(f, "nameB", 40);
    if (!nameA || !nameB) fail("Çiftin iki adını da yazın.");

    const main = kindOf(plan.mainKind);
    // Nikâh ayrı gündeyse ana tören yalnızca "Düğün" olarak anılır
    const mainTitle = plan.extraKind === "nikah" ? "Düğün Töreni" : main.title;
    const events: NewEvent[] = [];
    const toren = { date: s(f, "d_date", 10), time: s(f, "d_time", 5), venue: s(f, "d_venue", 80), address: s(f, "d_address", 120), ...placeFromForm(f, "d") };
    if (!isDate(toren.date) || !isTime(toren.time) || !toren.venue) fail(`${mainTitle} için tarih, saat ve yer zorunlu.`);
    if (toren.date < todayIso()) fail("Tören tarihi geçmişte olamaz.");
    events.push({ kind: main.id, title: mainTitle, ...toren });

    if (plan.extraKind) {
      const extra = kindOf(plan.extraKind);
      const e = { date: s(f, "k_date", 10), time: s(f, "k_time", 5), venue: s(f, "k_venue", 80), address: s(f, "k_address", 120), ...placeFromForm(f, "k") };
      if (!isDate(e.date) || !isTime(e.time) || !e.venue) fail(`${extra.title} için tarih, saat ve yer zorunlu.`);
      if (e.date < todayIso()) fail(`${extra.title} tarihi geçmişte olamaz.`);
      events.unshift({ kind: extra.id, title: extra.title, ...e });
    }

    const { text } = await writeInvitationText({
      plan, answers,
      heading: `${nameA} ile ${nameB}`,
      dateLabel: longDate(toren.date),
      venue: toren.venue,
      city: s(f, "city", 40),
      greeting: greetingFor(events),
      families: plan.families ? [s(f, "familyA", 60), s(f, "familyB", 60)].filter(Boolean).join(" ve ") : "",
      // Aileler yazıldıysa metin ailelerin ağzından kurulur ("Evlatlarımız Defne ile Mert…")
      names: plan.families && s(f, "familyA", 60) && s(f, "familyB", 60) ? [nameA, nameB] : undefined,
    });

    const admin = await createInvitation({
      nameA, nameB, city: s(f, "city", 40), events,
      busFrom: plan.wantsBus ? s(f, "busFrom", 120) : "",
      busTime: plan.wantsBus && isTime(s(f, "busTime", 5)) ? s(f, "busTime", 5) : "",
      busNote: plan.wantsBus ? s(f, "busNote", 160) : "",
      program: plan.wantsProgram ? s(f, "program", 600) : "",
      extraProgram: plan.wantsProgram ? s(f, "k_program", 600) : "",
      theme: plan.theme, font: plan.font, ornament: plan.ornament, pattern: plan.pattern, message: text,
      bus: plan.wantsBus ? placeFromForm(f, "bus") : undefined,
      opening: plan.opening,
      familyA: plan.families ? s(f, "familyA", 60) : "",
      familyB: plan.families ? s(f, "familyB", 60) : "",
      answers: answersQuery(answers),
    });
    redirect(`/yonet/${admin}`);
  }

  // Genel etkinlik dalı
  if (!(await allow("mobile-create", 20, 3600)))
    fail("Kısa sürede çok fazla etkinlik oluşturuldu. Bir saat sonra tekrar deneyin.");

  const title = s(f, "title", 100), hostName = s(f, "hostName", 80);
  const date = s(f, "date", 10), time = s(f, "time", 5), venue = s(f, "venue", 160);
  if (!title || !hostName) fail("Etkinliğin adını ve ev sahibini yazın.");
  if (!isDate(date) || !isTime(time) || !venue) fail("Tarih, saat ve yer zorunlu.");

  const request = plan.request ? s(f, "request", 160) : "";
  const { text } = await writeInvitationText({
    plan, answers, heading: title, host: hostName,
    dateLabel: longDate(date), venue, request,
  });

  const kapasite = s(f, "capacity", 8);
  let token = "";
  try {
    const event = await createMobileEvent(
      validateEvent({
        title, category: plan.category, hostName, date, time, venue,
        address: s(f, "address", 400), description: text,
        coverId: plan.coverId, coverData: null,
        capacity: kapasite ? Number(kapasite) : null,
        // Kullanıcı "fotoğrafsız" seçebilir; seçmediyse türün ilk fotoğrafı
        photoId: f.has("photoId") ? s(f, "photoId", 40) : plan.photo,
      }),
      siteUrl(),
      // Uygulama fotoğraflı kapağı gösterir; web davet sayfası bu tasarımı
      { theme: plan.theme, font: plan.font, ornament: plan.ornament, pattern: plan.pattern },
      placeFromForm(f, ""),
      answersQuery(answers)
    );
    token = event.manageToken;
  } catch (e) {
    fail(e instanceof MobileError ? e.message : "Etkinlik oluşturulamadı, tekrar deneyin.");
  }
  redirect(`/etkinlik/${token}?yeni=1`);
}
