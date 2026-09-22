import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { inviteLabel } from "@/lib/events";
import { shortDate } from "@/lib/format";
import { EventsCard, Hero, SiteFooter } from "@/components/Invite";
import { ThemeStyle } from "@/components/Theme";

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
  return (
    <main className="wrap">
      <ThemeStyle theme={data.inv.theme} />
      <p className="info" style={{ marginTop: 0 }}>Önizleme: davetlileriniz bunu kendi adlarıyla görür. <Link href={`/yonet/${token}`}>Yönetime dön</Link></p>
      <Hero inv={data.inv} greeting={<>Sevgili <b>misafirimiz</b>, bu mutlu günümüzde sizi aramızda görmek istiyoruz.</>} />
      <EventsCard inv={data.inv} events={data.events} title="Etkinlikler" calendarHref={`/onizleme/${token}/takvim`} />
      <SiteFooter />
    </main>
  );
}
