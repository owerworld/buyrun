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
      "--velvet": "#3E4C37", "--velvet2": "#4F6045", "--gold": "#D2C29C", "--gold-ink": "#75653F",
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
  {
    id: "lal",
    label: "Kına kırmızısı",
    hint: "Al & altın",
    swatch: ["#7E1620", "#F0C987", "#FAF4F2"],
    light: {
      "--bg": "#FAF4F2", "--card": "#FFFFFF", "--ink": "#2A1414", "--muted": "#6E5656",
      "--line": "#EEDDDA", "--chip": "#F6E9E6",
      "--velvet": "#7E1620", "--velvet2": "#A0222D", "--gold": "#F0C987", "--gold-ink": "#85541A",
      "--kina": "#B3202A", "--btn": "#7E1620", "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#160B0B", "--card": "#221212", "--ink": "#F6E8E6", "--muted": "#C4A9A6",
      "--line": "#3A2322", "--chip": "#2C1818",
      "--velvet": "#4A0D14", "--velvet2": "#6E1720", "--gold": "#F0C987", "--gold-ink": "#F0C987",
      "--kina": "#F07A80", "--btn": "#F0C987", "--btn-ink": "#4A0D14",
    },
    og: { bg: "#7E1620", bg2: "#A0222D", frame: "#F0C987", text: "#FFF3E6", accent: "#F0C987" },
  },
  {
    id: "gul",
    label: "Pudra gül",
    hint: "Gül kurusu & bakır",
    swatch: ["#6B2F42", "#E6BFA7", "#FBF6F5"],
    light: {
      "--bg": "#FBF6F5", "--card": "#FFFFFF", "--ink": "#2E1A1F", "--muted": "#6F5A60",
      "--line": "#EFDFE0", "--chip": "#F7EBEC",
      "--velvet": "#6B2F42", "--velvet2": "#8A4458", "--gold": "#E6BFA7", "--gold-ink": "#8A4A52",
      "--kina": "#B03A48", "--btn": "#6B2F42", "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#170E11", "--card": "#221519", "--ink": "#F6E9EC", "--muted": "#C2A8AF",
      "--line": "#3A262C", "--chip": "#2C1B20",
      "--velvet": "#3E1826", "--velvet2": "#5C2638", "--gold": "#E9C3AE", "--gold-ink": "#EDBFB0",
      "--kina": "#E77A86", "--btn": "#E9C3AE", "--btn-ink": "#3E1826",
    },
    og: { bg: "#6B2F42", bg2: "#8A4458", frame: "#E6BFA7", text: "#FBEFEA", accent: "#E6BFA7" },
  },
  {
    id: "zumrut",
    label: "Zümrüt",
    hint: "Zümrüt & altın",
    swatch: ["#0F3B2E", "#D4B26A", "#F3F6F4"],
    light: {
      "--bg": "#F3F6F4", "--card": "#FFFFFF", "--ink": "#14241E", "--muted": "#56665F",
      "--line": "#DCE6E1", "--chip": "#E8F0EC",
      "--velvet": "#0F3B2E", "--velvet2": "#1A5642", "--gold": "#D4B26A", "--gold-ink": "#6E5620",
      "--kina": "#A8323A", "--btn": "#0F3B2E", "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#0B1411", "--card": "#111E19", "--ink": "#E8F1ED", "--muted": "#A2B5AD",
      "--line": "#213530", "--chip": "#172722",
      "--velvet": "#0A2A20", "--velvet2": "#134233", "--gold": "#DDBE7A", "--gold-ink": "#E3C688",
      "--kina": "#E7727A", "--btn": "#DDBE7A", "--btn-ink": "#0A2A20",
    },
    og: { bg: "#0F3B2E", bg2: "#1A5642", frame: "#D4B26A", text: "#F4EEDC", accent: "#D4B26A" },
  },
  {
    id: "inci",
    label: "İnci",
    hint: "Fildişi & siyah",
    swatch: ["#FBF9F4", "#1C1C1C", "#E4E1DA"],
    // Açık zeminli tek tema: davetiye kartı fildişi, yazılar siyah
    light: {
      "--bg": "#F1EEE7", "--card": "#FFFFFF", "--ink": "#1C1C1C", "--muted": "#5E5E5E",
      "--line": "#E0DCD3", "--chip": "#ECE8E0",
      "--velvet": "#FBF9F4", "--velvet2": "#FFFFFF", "--gold": "#2A2A2A", "--gold-ink": "#3A3A3A",
      "--kina": "#A33A3A", "--btn": "#1C1C1C", "--btn-ink": "#FFFFFF",
      "--hero-ink": "#1C1C1C", "--hero-edge": "#E0DCD3",
    },
    dark: {
      "--bg": "#111111", "--card": "#1A1A1A", "--ink": "#F2F0EA", "--muted": "#ABABAB",
      "--line": "#2E2E2E", "--chip": "#222222",
      "--velvet": "#0E0E0E", "--velvet2": "#1E1E1E", "--gold": "#EDE8DC", "--gold-ink": "#EDE8DC",
      "--kina": "#E77A7A", "--btn": "#EDE8DC", "--btn-ink": "#111111",
      "--hero-ink": "#F2F0EA", "--hero-edge": "#2E2E2E",
    },
    og: { bg: "#FBF9F4", bg2: "#FFFFFF", frame: "#1C1C1C", text: "#1C1C1C", accent: "#3A3A3A" },
  },
];

export const DEFAULT_THEME = THEMES[0].id;
export const isTheme = (v: string) => THEMES.some((t) => t.id === v);
export const themeOf = (id: string | undefined) => THEMES.find((t) => t.id === id) ?? THEMES[0];
