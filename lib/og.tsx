import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Invitation } from "./data";
import { shortDate } from "./format";

/** WhatsApp, Telegram vb. link önizlemesi için poster ölçüsü. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = "Davetiye önizlemesi";

/** Davetiyenin renkleri (globals.css ile aynı değerler). */
const VELVET = "#3E0F24";
const VELVET2 = "#5A1532";
const GOLD = "#CFA85A";
const CREAM = "#F7EEDC";

const FONT_DIR = join(process.cwd(), "assets", "fonts");

type LoadedFonts = Awaited<ReturnType<typeof readFonts>>;
let fontCache: Promise<LoadedFonts> | null = null;

async function readFonts() {
  const [disp, ui, uiBold] = await Promise.all([
    readFile(join(FONT_DIR, "cormorant-600.ttf")),
    readFile(join(FONT_DIR, "manrope-500.ttf")),
    readFile(join(FONT_DIR, "manrope-700.ttf")),
  ]);
  // Türkçe karakterler için gömülü yazı tipleri (ç ğ ı İ ö ş ü)
  return [
    { name: "Cormorant", data: disp, weight: 600 as const, style: "normal" as const },
    { name: "Manrope", data: ui, weight: 500 as const, style: "normal" as const },
    { name: "Manrope", data: uiBold, weight: 700 as const, style: "normal" as const },
  ];
}

const fonts = () => (fontCache ??= readFonts());

/** İsimler uzadıkça yazı küçülsün ki poster taşmasın. */
function nameSize(text: string) {
  if (text.length <= 18) return 104;
  if (text.length <= 26) return 86;
  if (text.length <= 34) return 70;
  return 56;
}

export async function posterImage(inv: Invitation, label: string) {
  const line = `${inv.name_a} ile ${inv.name_b}`;
  const size = nameSize(line);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 34,
          backgroundColor: VELVET,
          backgroundImage: `radial-gradient(120% 90% at 50% 0%, ${VELVET2} 0%, ${VELVET} 72%)`,
          fontFamily: "Manrope",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${GOLD}`,
            borderRadius: 26,
            padding: "40px 56px",
          }}
        >
          <div style={{ display: "flex", fontSize: 24, fontWeight: 500, letterSpacing: 6, color: GOLD }}>
            MUTLULUĞUMUZA ORTAK OLUN
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              flexWrap: "wrap",
              margin: "26px 0 0",
              maxWidth: 1000,
              fontFamily: "Cormorant",
              fontWeight: 600,
              fontSize: size,
              lineHeight: 1.1,
              color: CREAM,
              textAlign: "center",
            }}
          >
            {line}
          </div>

          <div style={{ display: "flex", width: 220, height: 2, backgroundColor: GOLD, opacity: 0.7, margin: "30px 0" }} />

          <div style={{ display: "flex", fontFamily: "Cormorant", fontWeight: 600, fontSize: 48, color: CREAM }}>
            {shortDate(inv.main_date)}
          </div>

          {inv.city ? (
            <div style={{ display: "flex", marginTop: 10, fontSize: 28, fontWeight: 500, color: GOLD }}>{inv.city}</div>
          ) : null}

          <div style={{ display: "flex", marginTop: 34, fontSize: 22, fontWeight: 500, color: CREAM, opacity: 0.75 }}>
            {label}
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts() }
  );
}
