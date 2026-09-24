import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { designOf, detailsOf, mobileEventByToken, placeOf, publicEvent } from "@/lib/mobile";
import { ThemeStyle } from "@/components/Theme";
import { dayStatus, todayTr } from "@/lib/eventday";
import { forecastFor } from "@/lib/weather";
import { davetEkleri } from "@/lib/ornekler";
import { cevaplarOf } from "@/lib/sozler";
import Invitation from "./invitation";
export const dynamic = "force-dynamic";
/** Bağlantı önizlemesinde davetin kendi başlığı ve tarihi görünür; arama motorları yine görmez. */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const row = await mobileEventByToken(token, "invite");
  const temel: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };
  if (!row) return { ...temel, title: "Buyrun · Davetlisin" };
  const tarih = new Date(`${row.event_date}T12:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  const aciklama = `${tarih} · ${row.event_time} · ${row.venue}. Katılımını bağlantıdan bildir.`;
  return { ...temel, title: `${row.title} · Buyrun`, description: aciklama, openGraph: { title: row.title, description: aciklama } };
}
export default async function MobileInvitation({params,searchParams}: {
  params:Promise<{token:string}>;searchParams:Promise<{guest?:string | string[]}>
}) {
  const { token } = await params;
  const query = await searchParams;
  const row = await mobileEventByToken(token,"invite");
  if (!row) notFound();
  const guestToken = typeof query.guest === "string" ? query.guest : undefined;
  let event;
  try { event = await publicEvent(row,guestToken); } catch { notFound(); }
  const design = designOf(row);
  const place = placeOf(row);
  // Gün yaklaşınca üstte bant, 9 gün içindeyse hava tahmini (sunucuda hesaplanır)
  const dayState = dayStatus([{ title: row.title, date: row.event_date, time: row.event_time, place }]);
  const forecast = await forecastFor(row.lat, row.lng, row.event_date, row.event_time, todayTr());
  // Sihirbaz cevapları: hitap, sürpriz uyarısı, not kutusunun örneği
  const cevaplar = cevaplarOf(row.answers);
  const samimi = cevaplar.kim === "arkadaslar";
  const detay = detailsOf(row);
  return <>
    {design && <ThemeStyle theme={design.theme} />}
    <Invitation event={event} design={design} place={place} dayState={dayState} forecast={forecast} inviteToken={token} initialGuestToken={guestToken || null} samimi={samimi} ekler={davetEkleri(cevaplar, samimi, detay.surpriz)}
      detay={{ akis: detay.akis ?? "", mevlidhan: detay.mevlidhan ?? "" }} />
  </>;
}
