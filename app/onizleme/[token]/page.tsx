import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { greetingFor, inviteLabel } from "@/lib/events";
import { cevaplarOf, davetCumlesi, hitap } from "@/lib/sozler";
import { shortDate } from "@/lib/format";
import { EventsCard, Hero, MessageCard, SiteFooter } from "@/components/Invite";
import { ThemeStyle } from "@/components/Theme";
import { DayBanner } from "@/components/DayBanner";
import { weddingExtras } from "@/lib/extras";

/** Çift önizleme linkini paylaştığında da aynı poster görünür. */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const data = await getAdmin(token);
  if (!data) return { title: "Davetiye bulunamadı" };
  const { inv, events } = data;
  const title = `${inv.name_a} ile ${inv.name_b} · ${inviteLabel(events)}`;
  const description = [shortDate(inv.main_date), inv.city].filter(Boolean).join(" · ");
  return { title, description, openGraph: { type: "website", locale: "tr_TR", siteName: "Buyrun", title, description } };
}

export default async function Onizleme({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getAdmin(token);
  if (!data) notFound();
  const extras = await weddingExtras(data.events);
  const ton = cevaplarOf(data.inv.answers).ton;
  return (
    <main className="wrap">
      <ThemeStyle theme={data.inv.theme} />
      <p className="info" style={{ marginTop: 0 }}>Önizleme: davetlileriniz bunu kendi adlarıyla görür. <Link href={`/yonet/${token}`}>Yönetime dön</Link></p>
      <DayBanner status={extras.status} forecast={extras.bannerForecast} />
      <Hero inv={data.inv} greeting={<>{hitap(ton)} <b>misafirimiz</b>, {davetCumlesi(ton, greetingFor(data.events))}</>} />
      <MessageCard inv={data.inv} />
      <EventsCard inv={data.inv} events={data.events} title="Etkinlikler" calendarHref={`/onizleme/${token}/takvim`} weather={extras.forecasts} />
      <section className="card">
        <h2>Paylaşım görseli</h2>
        <p className="muted small">
          Hikâye ölçüsünde (1080×1920) dikey davetiye. Kişiye özel bilgi içermez, hesabınızdan paylaşabilirsiniz.
        </p>
        <a className="btn ghost full" href={`/onizleme/${token}/story`} download style={{ marginTop: 10 }}>
          Instagram hikâyesi görselini indir
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
