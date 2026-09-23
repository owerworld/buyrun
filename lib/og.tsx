import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { EventRow, Invitation } from "./data";
import { dayNum, monShort, shortDate } from "./format";
import { themeOf } from "./themes";

/** WhatsApp, Telegram vb. link önizlemesi için poster ölçüsü. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = "Davetiye önizlemesi";

const FONT_DIR = join(process.cwd(), "assets", "fonts");

type LoadedFonts = Awaited<ReturnType<typeof readFonts>>;
let fontCache: Promise<LoadedFonts> | null = null;

async function readFonts() {
  const [disp, ui, uiBold, dispItalic, vibes, playfair, josefin] = await Promise.all([
    readFile(join(FONT_DIR, "cormorant-600.ttf")),
    readFile(join(FONT_DIR, "manrope-500.ttf")),
    readFile(join(FONT_DIR, "manrope-700.ttf")),
    readFile(join(FONT_DIR, "cormorant-400i.ttf")),
    readFile(join(FONT_DIR, "greatvibes-400.ttf")),
    readFile(join(FONT_DIR, "playfair-500.ttf")),
    readFile(join(FONT_DIR, "josefin-300.ttf")),
  ]);
  // Türkçe karakterler için gömülü yazı tipleri (ç ğ ı İ ö ş ü)
  return [
    { name: "Cormorant", data: disp, weight: 600 as const, style: "normal" as const },
    { name: "Manrope", data: ui, weight: 500 as const, style: "normal" as const },
    { name: "Manrope", data: uiBold, weight: 700 as const, style: "normal" as const },
    { name: "Cormorant", data: dispItalic, weight: 400 as const, style: "italic" as const },
    { name: "GreatVibes", data: vibes, weight: 400 as const, style: "normal" as const },
    { name: "Playfair", data: playfair, weight: 500 as const, style: "normal" as const },
    { name: "Josefin", data: josefin, weight: 300 as const, style: "normal" as const },
  ];
}

const fonts = () => (fontCache ??= readFonts());

/** İsimler, davetiyede seçilen yazı karakteriyle yazılır (lib/design.ts ile aynı eşleme). */
function nameFont(font: string | undefined, size: number) {
  switch (font) {
    case "kaligrafi": return { fontFamily: "GreatVibes", fontWeight: 400, fontSize: Math.round(size * 1.12) } as const;
    case "gorkemli": return { fontFamily: "Playfair", fontWeight: 500, fontSize: Math.round(size * 0.86) } as const;
    case "modern": return { fontFamily: "Josefin", fontWeight: 300, fontSize: Math.round(size * 0.58), letterSpacing: "0.16em", textTransform: "uppercase" } as const;
    case "siir": return { fontFamily: "Cormorant", fontWeight: 400, fontStyle: "italic", fontSize: size } as const;
    default: return { fontFamily: "Cormorant", fontWeight: 600, fontSize: size } as const;
  }
}

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
  const { bg: VELVET, bg2: VELVET2, frame: GOLD, text: CREAM, accent: ACCENT } = themeOf(inv.theme).og;

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
          <div style={{ display: "flex", fontSize: 24, fontWeight: 500, letterSpacing: 6, color: ACCENT }}>
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
              ...nameFont(inv.font, size),
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
            <div style={{ display: "flex", marginTop: 10, fontSize: 28, fontWeight: 500, color: ACCENT }}>{inv.city}</div>
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

/** Instagram hikâyesi ölçüsü (dikey). */
export const storySize = { width: 1080, height: 1920 };

/** İsimler alt alta yazıldığı için hikâyede daha uzun satır sığar. */
function storyNameSize(a: string, b: string) {
  const longest = Math.max(a.length, b.length);
  if (longest <= 12) return 152;
  if (longest <= 17) return 124;
  if (longest <= 23) return 98;
  return 78;
}

/** İnce çizgi - eşkenar dörtgen - ince çizgi: davetiyedeki sırma motifinin sade hâli. */
function Ornament({ color }: { color: string }) {
  const line = { display: "flex", width: 120, height: 2, backgroundColor: color, opacity: 0.8 } as const;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={line} />
      <div
        style={{
          display: "flex",
          width: 18,
          height: 18,
          margin: "0 18px",
          border: `2px solid ${color}`,
          transform: "rotate(45deg)",
        }}
      />
      <div style={line} />
    </div>
  );
}

/**
 * Çiftin Instagram hikâyesinde paylaşacağı dikey davetiye görseli.
 * Kişiye özel bir bilgi taşımaz; çift kendi hesabından paylaşır.
 */
export async function storyImage(inv: Invitation, events: EventRow[]) {
  const t = themeOf(inv.theme).og;
  const size = storyNameSize(inv.name_a, inv.name_b);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 46,
          backgroundColor: t.bg,
          backgroundImage: `radial-gradient(110% 60% at 50% 0%, ${t.bg2} 0%, ${t.bg} 70%)`,
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
            border: `3px solid ${t.frame}`,
            borderRadius: 34,
            padding: "70px 56px",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, letterSpacing: 10, color: t.accent }}>
            MUTLULUĞUMUZA ORTAK OLUN
          </div>
          <div style={{ display: "flex", marginTop: 46 }}><Ornament color={t.frame} /></div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "46px 0 0",
              fontFamily: "Cormorant",
              fontWeight: 600,
              color: t.text,
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            <div style={{ display: "flex", ...nameFont(inv.font, size) }}>{inv.name_a}</div>
            <div style={{ display: "flex", fontSize: Math.round(size * 0.5), margin: "10px 0", color: t.accent }}>ile</div>
            <div style={{ display: "flex", ...nameFont(inv.font, size) }}>{inv.name_b}</div>
          </div>

          <div style={{ display: "flex", margin: "52px 0" }}><Ornament color={t.frame} /></div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 700 }}>
            {events.slice(0, 2).map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 124,
                    height: 124,
                    marginRight: 30,
                    border: `2px solid ${t.frame}`,
                    borderRadius: 18,
                    color: t.text,
                  }}
                >
                  <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 62, lineHeight: 1 }}>{dayNum(e.event_date)}</div>
                  <div style={{ display: "flex", fontSize: 24, marginTop: 6, color: t.accent }}>{monShort(e.event_date)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: t.text }}>{e.title}</div>
                  <div style={{ display: "flex", fontSize: 30, fontWeight: 500, marginTop: 8, color: t.accent }}>
                    {e.event_time} · {e.venue}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: 44, fontFamily: "Cormorant", fontWeight: 600, fontSize: 58, color: t.text }}>
            {shortDate(inv.main_date)}
          </div>
          {inv.city ? (
            <div style={{ display: "flex", marginTop: 10, fontSize: 34, fontWeight: 500, color: t.accent }}>{inv.city}</div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...storySize,
      fonts: await fonts(),
      headers: { "Content-Disposition": 'attachment; filename="davetiye-hikaye.png"' },
    }
  );
}
