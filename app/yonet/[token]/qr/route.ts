import { notFound } from "next/navigation";
import { ensurePublicToken } from "@/lib/data";
import { siteUrl } from "@/lib/format";
import { qrResponse } from "@/lib/qr";

/** Basılı davetiye QR'ı: herkese açık davetiye sayfasına gider, yönetim linkine asla. */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pub = await ensurePublicToken(token);
  if (!pub) notFound();
  const bicim = new URL(req.url).searchParams.get("bicim") === "svg" ? "svg" : "png";
  return qrResponse(`${siteUrl()}/g/${pub}`, bicim, "buyrun-davetiye-qr");
}
