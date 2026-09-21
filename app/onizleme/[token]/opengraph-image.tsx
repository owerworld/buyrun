import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { inviteLabel } from "@/lib/events";
import { ogAlt, ogContentType, ogSize, posterImage } from "@/lib/og";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getAdmin(token);
  if (!data) notFound();
  return posterImage(data.inv, inviteLabel(data.events));
}
