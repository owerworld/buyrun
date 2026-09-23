import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { designOf, mobileEventByToken, placeOf, publicEvent } from "@/lib/mobile";
import { ThemeStyle } from "@/components/Theme";
import { dayStatus, todayTr } from "@/lib/eventday";
import { forecastFor } from "@/lib/weather";
import Invitation from "./invitation";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Buyrun · Davetlisin", description: "Bir araya gelmenin en güzel bahanesi.",
  robots: { index: false, follow: false }, referrer: "no-referrer",
};
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
  return <>
    {design && <ThemeStyle theme={design.theme} />}
    <Invitation event={event} design={design} place={place} dayState={dayState} forecast={forecast} inviteToken={token} initialGuestToken={guestToken || null} />
  </>;
}
