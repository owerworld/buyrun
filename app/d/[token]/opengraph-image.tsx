import { notFound } from "next/navigation";
import { getGuest, inviteLabel } from "@/lib/data";
import { ogAlt, ogContentType, ogSize, posterImage } from "@/lib/og";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

/** WhatsApp'ta link paylaşıldığında görünen poster. Davetlinin adı posterde yer almaz. */
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getGuest(token);
  if (!data) notFound();
  return posterImage(data.inv, inviteLabel(data.events));
}
