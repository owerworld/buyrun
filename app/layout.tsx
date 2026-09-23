import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/format";
import "./globals.css";

const display = localFont({
  src: [
    { path: "../assets/fonts/cormorant-400.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/cormorant-400i.ttf", weight: "400", style: "italic" },
    { path: "../assets/fonts/cormorant-500.ttf", weight: "500", style: "normal" },
    { path: "../assets/fonts/cormorant-600.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-display", display: "swap",
});
const ui = localFont({
  src: [
    { path: "../assets/fonts/manrope-400.ttf", weight: "400" },
    { path: "../assets/fonts/manrope-500.ttf", weight: "500" },
    { path: "../assets/fonts/manrope-700.ttf", weight: "700" },
  ],
  variable: "--font-ui", display: "swap",
});
// Davetiye yazı karakterleri: yalnızca o tasarımı seçen sayfada indirilir (preload yok)
const playfair = localFont({
  src: [
    { path: "../assets/fonts/playfair-500.ttf", weight: "500", style: "normal" },
    { path: "../assets/fonts/playfair-400i.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-playfair", display: "swap", preload: false,
});
const vibes = localFont({ src: "../assets/fonts/greatvibes-400.ttf", weight: "400", variable: "--font-vibes", display: "swap", preload: false });
const josefin = localFont({
  src: [{ path: "../assets/fonts/josefin-300.ttf", weight: "300" }, { path: "../assets/fonts/josefin-400.ttf", weight: "400" }],
  variable: "--font-josefin", display: "swap", preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Buyrun – Dijital davetiye ve LCV",
  description: "Kına ve düğün tek linkte. Üyeliksiz LCV, iki aile paneli.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3E0F24",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={[display, ui, playfair, vibes, josefin].map((f) => f.variable).join(" ")}>
      <body>{children}</body>
    </html>
  );
}
