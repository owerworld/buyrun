import { notFound } from "next/navigation";
import { mobileEventByToken } from "@/lib/mobile";
import { eventPoster, ogContentType, ogSize } from "@/lib/og";

export const alt = "Davet önizlemesi";
export const size = ogSize;
export const contentType = ogContentType;

/** WhatsApp'ta davet bağlantısı paylaşılınca görünen kart: kapak, başlık, tarih ve yer. */
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await mobileEventByToken(token, "invite");
  if (!row) notFound();
  return eventPoster(row);
}
