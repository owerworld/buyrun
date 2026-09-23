import { siteUrl } from "@/lib/format";
import { FOTOLAR, fotoSrc, fotolarFor } from "@/lib/fotolar";
import { mobileJson, mobileOptions } from "@/lib/mobile";

export const OPTIONS = mobileOptions;

/**
 * Kapak fotoğrafları: uygulama ve web aynı listeyi kullanır.
 * ?tur=sunnet → o türün fotoğrafları; tür yoksa hepsi.
 *
 * Fotoğraflar bu sunucudan verilir (public/foto). Davetlinin telefonu başka bir
 * görsel servisine istek atmaz; lisanslar CC0, atıf satırı yine de gönderilir.
 */
export async function GET(req: Request) {
  const tur = new URL(req.url).searchParams.get("tur") ?? "";
  const list = tur ? fotolarFor(tur) : FOTOLAR;
  const origin = siteUrl();
  const res = mobileJson({
    fotolar: list.map((f) => ({ id: f.id, tur: f.tur, alt: f.alt, credit: f.credit, link: f.link, license: "CC0", url: `${origin}${fotoSrc(f.id)}` })),
  });
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res;
}
