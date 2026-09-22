import { notFound } from "next/navigation";
import { getGuest } from "@/lib/data";
import { siteUrl } from "@/lib/format";
import { buildIcs, icsResponse } from "@/lib/ics";

/** Davetlinin çağrıldığı günleri telefon takvimine ekler. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getGuest(token);
  if (!data) notFound();
  return icsResponse(buildIcs(data.inv, data.events, `${siteUrl()}/d/${token}`));
}
