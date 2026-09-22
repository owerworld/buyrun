import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { mobileEventByToken, publicEvent } from "@/lib/mobile";
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
  return <Invitation event={event} inviteToken={token} initialGuestToken={guestToken || null} />;
}
