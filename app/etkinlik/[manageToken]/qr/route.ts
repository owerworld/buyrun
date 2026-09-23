import { notFound } from "next/navigation";
import { mobileEventByToken } from "@/lib/mobile";
import { siteUrl } from "@/lib/format";
import { qrResponse } from "@/lib/qr";

/** Etkinlik afişi ya da basılı davet için QR: herkese açık davet linkine gider. */
export async function GET(req: Request, { params }: { params: Promise<{ manageToken: string }> }) {
  const { manageToken } = await params;
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) notFound();
  const bicim = new URL(req.url).searchParams.get("bicim") === "svg" ? "svg" : "png";
  return qrResponse(`${siteUrl()}/m/${row.invite_token}`, bicim, "buyrun-etkinlik-qr");
}
