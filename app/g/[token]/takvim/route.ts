import { notFound } from "next/navigation";
import { getPublic } from "@/lib/data";
import { siteUrl } from "@/lib/format";
import { buildIcs, icsResponse } from "@/lib/ics";

/** Basılı davetiyedeki QR'dan gelen kişi de günleri takvimine ekleyebilsin. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getPublic(token);
  if (!data) notFound();
  return icsResponse(buildIcs(data.inv, data.events, `${siteUrl()}/g/${token}`));
}
