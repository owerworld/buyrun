import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { siteUrl } from "@/lib/format";
import { buildIcs, icsResponse } from "@/lib/ics";

/** Çiftin kendi takvimi için aynı dosya. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getAdmin(token);
  if (!data) notFound();
  return icsResponse(buildIcs(data.inv, data.events, `${siteUrl()}/onizleme/${token}`));
}
