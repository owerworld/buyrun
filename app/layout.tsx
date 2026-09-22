import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/format";
import "./globals.css";

const display = localFont({ src: "../assets/fonts/cormorant-600.ttf", variable: "--font-display", display: "swap", weight: "600" });
const ui = localFont({ src: [{ path: "../assets/fonts/manrope-500.ttf", weight: "500" }, { path: "../assets/fonts/manrope-700.ttf", weight: "700" }], variable: "--font-ui", display: "swap" });

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
    <html lang="tr" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
