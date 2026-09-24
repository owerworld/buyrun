import { notFound } from "next/navigation";
import { buildEventIcs, icsResponse } from "@/lib/ics";
import { siteUrl } from "@/lib/format";
import { mobileEventByToken } from "@/lib/mobile";

/** Davetli, bağlantıdan açtığı daveti tek dokunuşla takvimine ekler (bir gün önce hatırlatmalı). */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await mobileEventByToken(token, "invite");
  if (!row) notFound();
  return icsResponse(
    buildEventIcs(
      { id: row.id, title: row.title, date: row.event_date, time: row.event_time, venue: row.venue, address: row.address, lat: row.lat, lng: row.lng },
      `${siteUrl()}/m/${token}`
    )
  );
}
