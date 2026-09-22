/**
 * Excel'de sorunsuz açılan CSV üretir.
 *
 * Türkçe Windows'ta Excel varsayılan olarak noktalı virgülle ayırır ve dosyanın
 * başındaki BOM olmadan Türkçe karakterleri bozar; ikisi de burada karşılanıyor.
 */
const BOM = "﻿";

/** Excel, "=" ya da "+" ile başlayan hücreyi formül sanır; başına kesme işareti konur. */
const guard = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

const cell = (v: string | number) => `"${guard(String(v ?? "")).replace(/"/g, '""')}"`;

export function toCsv(headers: string[], rows: (string | number)[][]) {
  return BOM + [headers, ...rows].map((r) => r.map(cell).join(";")).join("\r\n") + "\r\n";
}

/** HTTP başlığı yalnızca ASCII taşır; Türkçe harfler sadeleştirilir. */
const asciiName = (v: string) =>
  v.replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => "cgiosuCGIOSU"["çğıöşüÇĞİÖŞÜ".indexOf(c)]).replace(/[^\w.-]/g, "-");

export const csvResponse = (body: string, filename: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // Eski tarayıcılar sade adı, yeniler UTF-8 olanı kullanır
      "Content-Disposition":
        `attachment; filename="${asciiName(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
