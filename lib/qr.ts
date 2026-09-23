import QRCode from "qrcode";

/**
 * Basılı davetiye için QR kod. Koyu mürekkep açık zemin: her telefon okur.
 * Hata düzeltme "Q" (%25): kâğıt kıvrılsa ya da hafif lekelense de okunur.
 */
const OPTS = { errorCorrectionLevel: "Q" as const, margin: 2, color: { dark: "#111111", light: "#ffffff" } };

export async function qrResponse(url: string, bicim: string, dosya: string) {
  if (bicim === "svg") {
    const svg = await QRCode.toString(url, { ...OPTS, type: "svg" });
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, max-age=3600", "Content-Disposition": `inline; filename="${dosya}.svg"` },
    });
  }
  // Baskı için 1200 px: 5 cm'de 600 dpi'dan fazla
  const png = await QRCode.toBuffer(url, { ...OPTS, type: "png", width: 1200 });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600", "Content-Disposition": `attachment; filename="${dosya}.png"` },
  });
}
