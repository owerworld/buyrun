import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublic } from "@/lib/data";
import { greetingFor, inviteLabel } from "@/lib/events";
import { shortDate } from "@/lib/format";
import { weddingExtras } from "@/lib/extras";
import { EventsCard, Hero, MessageCard, SiteFooter } from "@/components/Invite";
import { DayBanner } from "@/components/DayBanner";
import { ThemeStyle } from "@/components/Theme";

/**
 * Basılı davetiyedeki QR kodun açtığı sayfa. Herkese aynıdır: davetiye, günler,
 * yol tarifi ve takvim. Davetli listesi ve kişisel yanıt burada yoktur; katılım
 * aileden gelen kişisel linkle bildirilir.
 */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const data = await getPublic(token);
  if (!data) return { title: "Davetiye bulunamadı" };
  const title = `${data.inv.name_a} ile ${data.inv.name_b} · ${inviteLabel(data.events)}`;
  return { title, description: [shortDate(data.inv.main_date), data.inv.city].filter(Boolean).join(" · "), robots: { index: false, follow: false } };
}

export default async function GenelDavetiye({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getPublic(token);
  if (!data) notFound();
  const { inv, events } = data;
  const extras = await weddingExtras(events);
  const selam = greetingFor(events);
  return (
    <main className="wrap invite-wrap">
      <ThemeStyle theme={inv.theme} />
      <DayBanner status={extras.status} forecast={extras.bannerForecast} />
      <Hero inv={inv} greeting={<>{selam.charAt(0).toLocaleUpperCase("tr") + selam.slice(1)} sizi aramızda görmek istiyoruz.</>} />
      <MessageCard inv={inv} />
      <EventsCard inv={inv} events={events} title="Etkinlikler" calendarHref={`/g/${token}/takvim`} weather={extras.forecasts} />
      <section className="card">
        <h2>Katılım bildirimi</h2>
        <p className="muted small" style={{ margin: 0 }}>
          Katılımınızı size WhatsApp'tan gönderilen kişisel linkten bildirebilirsiniz. Link elinizde yoksa
          sizi davet eden aileden isteyebilirsiniz.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
