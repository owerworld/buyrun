/**
 * Hazır temalar.
 *
 * Renkler 2026 Türkiye davetiye trendlerine göre seçildi: geleneksel bordo-altın yanında
 * "sessiz lüks" akımının kırık beyaz / kum bejı + zeytin yeşili vurgusu ve lacivert-gece tonu.
 * Her tema globals.css'teki değişkenleri ezer, yeni CSS yapısı kurulmaz.
 */

export type Vars = Record<string, string>;

export interface Theme {
  id: string;
  label: string;
  hint: string;
  /** Seçim ekranındaki üç renkli küçük örnek */
  swatch: [string, string, string];
  /** Açık mod değişkenleri (boşsa globals.css varsayılanı kullanılır) */
  light: Vars;
  /** Koyu mod değişkenleri */
  dark: Vars;
  /** Link önizleme posterinin renkleri */
  og: { bg: string; bg2: string; frame: string; text: string; accent: string };
}

export const THEMES: Theme[] = [
  {
    id: "klasik",
    label: "Klasik",
    hint: "Bordo & altın",
    swatch: ["#3E0F24", "#CFA85A", "#F5F3F7"],
    light: {},
    dark: {},
    og: { bg: "#3E0F24", bg2: "#5A1532", frame: "#CFA85A", text: "#F7EEDC", accent: "#CFA85A" },
  },
  {
    id: "krem",
    label: "Sade krem",
    hint: "Kum & zeytin",
    swatch: ["#4A5A42", "#C6B38A", "#F7F4EE"],
    light: {
      "--bg": "#F7F4EE", "--card": "#FFFDF9", "--ink": "#2B2A24", "--muted": "#6A6558",
      "--line": "#E6E0D2", "--chip": "#F0EADC",
      "--velvet": "#3E4C37", "--velvet2": "#5E7052", "--gold": "#C6B38A", "--gold-ink": "#75653F",
      "--kina": "#A8573F", "--btn": "#3E4C37", "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#14150F", "--card": "#1D1F17", "--ink": "#F1EEE3", "--muted": "#ADA694",
      "--line": "#2E3126", "--chip": "#252819",
      "--velvet": "#20261B", "--velvet2": "#38402F", "--gold": "#D3C39C", "--gold-ink": "#DCCDA6",
      "--kina": "#D98A6B", "--btn": "#D3C39C", "--btn-ink": "#20241A",
    },
    og: { bg: "#F3EFE4", bg2: "#FBF8F1", frame: "#8A9A78", text: "#2F3A28", accent: "#75653F" },
  },
  {
    id: "gece",
    label: "Modern koyu",
    hint: "Lacivert & altın",
    swatch: ["#111726", "#C9A961", "#283044"],
    // Bu tema hem açık hem koyu modda koyu görünür; "modern koyu" olmasının sebebi bu.
    light: {
      "--bg": "#0F1420", "--card": "#181D2A", "--ink": "#EDF0F7", "--muted": "#A3ABC0",
      "--line": "#283044", "--chip": "#1F2636",
      "--velvet": "#111726", "--velvet2": "#1C2740", "--gold": "#C9A961", "--gold-ink": "#E0C384",
      "--kina": "#E0707A", "--btn": "#C9A961", "--btn-ink": "#0F1420",
      "--ok": "#5CCB93", "--ok-bg": "#12301F", "--no": "#F08A8A", "--no-bg": "#351717",
      "--wait": "#E6BF63", "--wait-bg": "#312812", "--focus": "#8FB2FF",
    },
    dark: {
      "--bg": "#0B0F18", "--card": "#141926", "--ink": "#EDF0F7", "--muted": "#A3ABC0",
      "--line": "#232B3E", "--chip": "#1A2031",
      "--velvet": "#0D1220", "--velvet2": "#1A2438", "--gold": "#C9A961", "--gold-ink": "#E0C384",
      "--kina": "#E0707A", "--btn": "#C9A961", "--btn-ink": "#0B0F18",
      "--ok": "#5CCB93", "--ok-bg": "#12301F", "--no": "#F08A8A", "--no-bg": "#351717",
      "--wait": "#E6BF63", "--wait-bg": "#312812", "--focus": "#8FB2FF",
    },
    og: { bg: "#0F1420", bg2: "#1C2740", frame: "#C9A961", text: "#EDF0F7", accent: "#C9A961" },
  },
];

export const DEFAULT_THEME = THEMES[0].id;
export const isTheme = (v: string) => THEMES.some((t) => t.id === v);
export const themeOf = (id: string | undefined) => THEMES.find((t) => t.id === id) ?? THEMES[0];
