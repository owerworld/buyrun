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
  {
    id: "turkuaz",
    label: "İznik",
    hint: "Kobalt, turkuaz & mercan",
    // İznik çinisinin üç rengi: kobalt zemin, turkuaz çizgi, mercan vurgu
    swatch: ["#123E6B", "#7FD1D3", "#C8453A"],
    light: {
      "--bg": "#F3F7F8", "--card": "#FFFFFF", "--ink": "#10263A", "--muted": "#55687A",
      "--line": "#DCE6EA", "--chip": "#E8F1F4",
      "--velvet": "#123E6B", "--velvet2": "#1B5486", "--gold": "#8AD9DA", "--gold-ink": "#1D5F7A",
      "--kina": "#C8453A", "--btn": "#123E6B", "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#0A141D", "--card": "#101E2B", "--ink": "#E8F1F6", "--muted": "#9FB3C2",
      "--line": "#1E3142", "--chip": "#152636",
      "--velvet": "#0B2744", "--velvet2": "#133A60", "--gold": "#8ADADB", "--gold-ink": "#8ADADB",
      "--kina": "#F08A7E", "--btn": "#8ADADB", "--btn-ink": "#0B2744",
    },
    og: { bg: "#123E6B", bg2: "#1B5486", frame: "#8AD9DA", text: "#F2FAFB", accent: "#8AD9DA" },
  },
  {
    id: "pastel",
    label: "Pastel",
    hint: "Latte, vizon & adaçayı",
    // Bebek kutlamalarında 2026'nın cinsiyetsiz toprak/pastel tonları; açık zeminli kapak
    swatch: ["#F4ECE4", "#8A6A55", "#A8BBA3"],
    light: {
      "--bg": "#F7F2EE", "--card": "#FFFFFF", "--ink": "#2F2621", "--muted": "#6B5D54",
      "--line": "#EADFD6", "--chip": "#F1E8E0",
      "--velvet": "#F4ECE4", "--velvet2": "#FBF7F2", "--gold": "#7D5F4A", "--gold-ink": "#7D5F4A",
      "--kina": "#B0584A", "--btn": "#6F5443", "--btn-ink": "#FFFFFF",
      "--hero-ink": "#3B2E26", "--hero-edge": "#EADFD6",
    },
    dark: {
      "--bg": "#16120F", "--card": "#201A16", "--ink": "#F3ECE6", "--muted": "#BFB0A5",
      "--line": "#352C25", "--chip": "#2A221D",
      "--velvet": "#2A211C", "--velvet2": "#3A2E27", "--gold": "#E0C9B5", "--gold-ink": "#E0C9B5",
      "--kina": "#E99A8C", "--btn": "#E0C9B5", "--btn-ink": "#2A211C",
      "--hero-ink": "#F4ECE4", "--hero-edge": "#352C25",
    },
    og: { bg: "#F4ECE4", bg2: "#FBF7F2", frame: "#8A6A55", text: "#3B2E26", accent: "#7D5F4A" },
  },
  {
    id: "mor",
    label: "Kına moru",
    hint: "Mor & altın",
    // Kınada ve düğünde son yılların gözdesi: mor kına konsepti
    swatch: ["#3D1A4F", "#E3C27A", "#F7F3F9"],
    light: {
      "--bg": "#F7F3F9", "--card": "#FFFFFF", "--ink": "#231629", "--muted": "#65566C",
      "--line": "#E7DDEC", "--chip": "#F1EAF4", "--velvet": "#3D1A4F", "--velvet2": "#55276B",
      "--gold": "#E3C27A", "--gold-ink": "#74521C", "--kina": "#B3202A", "--btn": "#3D1A4F",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#130D17", "--card": "#1D1422", "--ink": "#F2EAF5", "--muted": "#BBA9C3",
      "--line": "#33263A", "--chip": "#261B2C", "--velvet": "#2A1037", "--velvet2": "#43205A",
      "--gold": "#E3C27A", "--gold-ink": "#E8CA8A", "--kina": "#F07A80", "--btn": "#E3C27A",
      "--btn-ink": "#2A1037",
    },
    og: { bg: "#3D1A4F", bg2: "#55276B", frame: "#E3C27A", text: "#F8EFFB", accent: "#E3C27A" },
  },
  {
    id: "fusya",
    label: "Şeker pembe",
    hint: "Fuşya & şeftali",
    // Bekârlığa veda ve doğum günü partilerinin canlı pembesi
    swatch: ["#8E1452", "#FFD9B0", "#FCF4F8"],
    light: {
      "--bg": "#FCF4F8", "--card": "#FFFFFF", "--ink": "#2C1320", "--muted": "#6E5361",
      "--line": "#F1DCE7", "--chip": "#F8E8F0", "--velvet": "#8E1452", "--velvet2": "#B01E68",
      "--gold": "#FFD9B0", "--gold-ink": "#8E1452", "--kina": "#B3202A", "--btn": "#8E1452",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#170A11", "--card": "#22101A", "--ink": "#F9E9F1", "--muted": "#CBA8B9",
      "--line": "#3B2130", "--chip": "#2C1622", "--velvet": "#5A0C35", "--velvet2": "#7E1450",
      "--gold": "#FFD2A8", "--gold-ink": "#F9B8D0", "--kina": "#F07A9A", "--btn": "#FFD2A8",
      "--btn-ink": "#5A0C35",
    },
    og: { bg: "#8E1452", bg2: "#B01E68", frame: "#FFD9B0", text: "#FFF1F6", accent: "#FFD9B0" },
  },
  {
    id: "bebekpembe",
    label: "Bebek pembesi",
    hint: "Pudra pembe & krem",
    // Açık zeminli kapak: kız bebek beklenen baby shower ve diş buğdayı
    swatch: ["#FBE6EC", "#9C4A63", "#F6C9D6"],
    light: {
      "--bg": "#FDF6F8", "--card": "#FFFFFF", "--ink": "#33202A", "--muted": "#735C66",
      "--line": "#F3DFE6", "--chip": "#FAEBF0", "--velvet": "#FBE6EC", "--velvet2": "#FFF4F7",
      "--gold": "#9C4A63", "--gold-ink": "#9C4A63", "--kina": "#B0404F", "--btn": "#9C4A63",
      "--btn-ink": "#FFFFFF", "--hero-ink": "#4A2230", "--hero-edge": "#F2D4DD",
    },
    dark: {
      "--bg": "#170F12", "--card": "#22161B", "--ink": "#F8EAEF", "--muted": "#C6AAB5",
      "--line": "#3A2830", "--chip": "#2C1D23", "--velvet": "#3A1E28", "--velvet2": "#4E2A37",
      "--gold": "#F6C9D6", "--gold-ink": "#F6C9D6", "--kina": "#F08A9A", "--btn": "#F6C9D6",
      "--btn-ink": "#3A1E28", "--hero-ink": "#FBE6EC", "--hero-edge": "#3A2830",
    },
    og: { bg: "#FBE6EC", bg2: "#FFF4F7", frame: "#C98A9E", text: "#4A2230", accent: "#9C4A63" },
  },
  {
    id: "bebekmavi",
    label: "Bebek mavisi",
    hint: "Gök mavisi & gümüş",
    // Açık zeminli kapak: erkek bebek, sünnet ve çocuk davetleri
    swatch: ["#E3EEF8", "#2F5E86", "#B9D6EF"],
    light: {
      "--bg": "#F4F8FC", "--card": "#FFFFFF", "--ink": "#182A3A", "--muted": "#566879",
      "--line": "#DDE7F0", "--chip": "#EAF1F8", "--velvet": "#E3EEF8", "--velvet2": "#F4F9FD",
      "--gold": "#2F5E86", "--gold-ink": "#2F5E86", "--kina": "#B0404F", "--btn": "#2F5E86",
      "--btn-ink": "#FFFFFF", "--hero-ink": "#1D3A55", "--hero-edge": "#D3E2EF",
    },
    dark: {
      "--bg": "#0D131A", "--card": "#141D27", "--ink": "#EAF2F9", "--muted": "#A5B6C6",
      "--line": "#24313F", "--chip": "#1A2531", "--velvet": "#16283A", "--velvet2": "#20384F",
      "--gold": "#B9D6EF", "--gold-ink": "#B9D6EF", "--kina": "#F08A8A", "--btn": "#B9D6EF",
      "--btn-ink": "#16283A", "--hero-ink": "#EAF2F9", "--hero-edge": "#24313F",
    },
    og: { bg: "#E3EEF8", bg2: "#F4F9FD", frame: "#7FA4C6", text: "#1D3A55", accent: "#2F5E86" },
  },
  {
    id: "tahmin",
    label: "Pembe & mavi",
    hint: "Kız mı, erkek mi?",
    // Cinsiyet partisi: pembeden maviye geçen zemin, cevap sürprizde
    swatch: ["#F6C9D6", "#B9D3F2", "#FBF6F9"],
    light: {
      "--bg": "#FBF6F9", "--card": "#FFFFFF", "--ink": "#2A2233", "--muted": "#675E70",
      "--line": "#ECE2EA", "--chip": "#F4ECF2", "--velvet": "#FBE3EA", "--velvet2": "#E3EDF9",
      "--gold": "#3F5F8C", "--gold-ink": "#3F5F8C", "--kina": "#B0404F", "--btn": "#3F5F8C",
      "--btn-ink": "#FFFFFF", "--hero-ink": "#3A2340", "--hero-edge": "#ECDCE6",
    },
    dark: {
      "--bg": "#121019", "--card": "#1B1824", "--ink": "#F2EEF7", "--muted": "#B4ACC0",
      "--line": "#302B3B", "--chip": "#24202E", "--velvet": "#3A2033", "--velvet2": "#1E2C45",
      "--gold": "#F4C6D4", "--gold-ink": "#B9D3F2", "--kina": "#F08A9A", "--btn": "#B9D3F2",
      "--btn-ink": "#1E2C45", "--hero-ink": "#F2EEF7", "--hero-edge": "#302B3B",
    },
    og: { bg: "#FBE3EA", bg2: "#E3EDF9", frame: "#7FA0CC", text: "#3A2340", accent: "#3F5F8C" },
  },
  {
    id: "bugday",
    label: "Buğday",
    hint: "Buğday sarısı & krem",
    // Diş buğdayının, bereketin rengi; açık zeminli kapak
    swatch: ["#F5E9CC", "#7A5A1E", "#C9A659"],
    light: {
      "--bg": "#FAF6EC", "--card": "#FFFFFF", "--ink": "#2C2415", "--muted": "#6A5E48",
      "--line": "#ECE3CF", "--chip": "#F4EDDC", "--velvet": "#F5E9CC", "--velvet2": "#FCF6E6",
      "--gold": "#7A5A1E", "--gold-ink": "#7A5A1E", "--kina": "#A8452F", "--btn": "#7A5A1E",
      "--btn-ink": "#FFFFFF", "--hero-ink": "#3E2F12", "--hero-edge": "#EADBB5",
    },
    dark: {
      "--bg": "#15120B", "--card": "#201B11", "--ink": "#F5EEDC", "--muted": "#BDB095",
      "--line": "#362E1E", "--chip": "#292316", "--velvet": "#33280F", "--velvet2": "#4A3A17",
      "--gold": "#EBCB85", "--gold-ink": "#EBCB85", "--kina": "#E8906E", "--btn": "#EBCB85",
      "--btn-ink": "#33280F", "--hero-ink": "#F5E9CC", "--hero-edge": "#362E1E",
    },
    og: { bg: "#F5E9CC", bg2: "#FCF6E6", frame: "#C9A659", text: "#3E2F12", accent: "#7A5A1E" },
  },
  {
    id: "siyahaltin",
    label: "Siyah & altın",
    hint: "Gece gibi şık",
    // Mezuniyet ve şık akşamların klasiği
    swatch: ["#111111", "#D8B560", "#F4F2EE"],
    light: {
      "--bg": "#F4F2EE", "--card": "#FFFFFF", "--ink": "#1A1A1A", "--muted": "#5E5B55",
      "--line": "#E2DED6", "--chip": "#ECE9E2", "--velvet": "#111111", "--velvet2": "#262626",
      "--gold": "#D8B560", "--gold-ink": "#6E5520", "--kina": "#A33A3A", "--btn": "#111111",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#0B0B0B", "--card": "#151515", "--ink": "#F2EFE8", "--muted": "#ABA79E",
      "--line": "#2B2B2B", "--chip": "#1E1E1E", "--velvet": "#0A0A0A", "--velvet2": "#1E1E1E",
      "--gold": "#D8B560", "--gold-ink": "#E3C57C", "--kina": "#E77A7A", "--btn": "#D8B560",
      "--btn-ink": "#0A0A0A",
    },
    og: { bg: "#111111", bg2: "#262626", frame: "#D8B560", text: "#F7F2E6", accent: "#D8B560" },
  },
  {
    id: "bayrak",
    label: "Al bayrak",
    hint: "Al & beyaz",
    // Asker uğurlamasının al bayrağı: kırmızı zemin, beyaz süsleme
    swatch: ["#B00D1B", "#FFFFFF", "#FBF5F5"],
    light: {
      "--bg": "#FBF5F5", "--card": "#FFFFFF", "--ink": "#2A1414", "--muted": "#6E5656",
      "--line": "#EEDADA", "--chip": "#F7E8E8", "--velvet": "#B00D1B", "--velvet2": "#D3101F",
      "--gold": "#FFFFFF", "--gold-ink": "#B00D1B", "--kina": "#B00D1B", "--btn": "#B00D1B",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#150909", "--card": "#211010", "--ink": "#F8ECEC", "--muted": "#C8A9A9",
      "--line": "#3C2222", "--chip": "#2C1616", "--velvet": "#7A0913", "--velvet2": "#A00D1A",
      "--gold": "#FFFFFF", "--gold-ink": "#FFB3B8", "--kina": "#FF8A92", "--btn": "#FFFFFF",
      "--btn-ink": "#7A0913",
    },
    og: { bg: "#B00D1B", bg2: "#D3101F", frame: "#FFFFFF", text: "#FFFFFF", accent: "#FFFFFF" },
  },
  {
    id: "haki",
    label: "Haki",
    hint: "Haki & kum",
    swatch: ["#3B4230", "#D9C89A", "#F5F4EE"],
    light: {
      "--bg": "#F5F4EE", "--card": "#FFFFFF", "--ink": "#23261C", "--muted": "#5F6353",
      "--line": "#E2E1D3", "--chip": "#EDECE1", "--velvet": "#3B4230", "--velvet2": "#4F583F",
      "--gold": "#D9C89A", "--gold-ink": "#5E5530", "--kina": "#A8452F", "--btn": "#3B4230",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#11130D", "--card": "#1A1D14", "--ink": "#EEF0E6", "--muted": "#ADB29E",
      "--line": "#2D3124", "--chip": "#22261A", "--velvet": "#262B1E", "--velvet2": "#39402D",
      "--gold": "#D9C89A", "--gold-ink": "#DDCFA5", "--kina": "#E8906E", "--btn": "#D9C89A",
      "--btn-ink": "#262B1E",
    },
    og: { bg: "#3B4230", bg2: "#4F583F", frame: "#D9C89A", text: "#F4F1E4", accent: "#D9C89A" },
  },
  {
    id: "hurma",
    label: "Hurma",
    hint: "Hurma kahvesi & altın",
    // İftar sofrasının ve hac dönüşünün hurması
    swatch: ["#3E2415", "#E2BE78", "#F8F3EE"],
    light: {
      "--bg": "#F8F3EE", "--card": "#FFFFFF", "--ink": "#2B1D14", "--muted": "#6A5A4E",
      "--line": "#EADFD4", "--chip": "#F3EAE1", "--velvet": "#3E2415", "--velvet2": "#57331E",
      "--gold": "#E2BE78", "--gold-ink": "#7A5420", "--kina": "#A8452F", "--btn": "#3E2415",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#140E0A", "--card": "#1F1610", "--ink": "#F5ECE3", "--muted": "#BFAE9E",
      "--line": "#362920", "--chip": "#2A1F17", "--velvet": "#2A170C", "--velvet2": "#422615",
      "--gold": "#E2BE78", "--gold-ink": "#E7C688", "--kina": "#E8906E", "--btn": "#E2BE78",
      "--btn-ink": "#2A170C",
    },
    og: { bg: "#3E2415", bg2: "#57331E", frame: "#E2BE78", text: "#F8EEDF", accent: "#E2BE78" },
  },
  {
    id: "terrakota",
    label: "Kiremit",
    hint: "Terrakota & krem",
    // Ev sofrasının, toprak kabın sıcaklığı
    swatch: ["#8A3B24", "#F6DDBF", "#FAF4EF"],
    light: {
      "--bg": "#FAF4EF", "--card": "#FFFFFF", "--ink": "#2D1C15", "--muted": "#6B5850",
      "--line": "#EEDDD2", "--chip": "#F6EAE2", "--velvet": "#8A3B24", "--velvet2": "#A54B2F",
      "--gold": "#F6DDBF", "--gold-ink": "#8A3B24", "--kina": "#A8452F", "--btn": "#8A3B24",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#150D0A", "--card": "#211510", "--ink": "#F7EBE4", "--muted": "#C4AA9D",
      "--line": "#3A261E", "--chip": "#2C1C16", "--velvet": "#5A2515", "--velvet2": "#7A341F",
      "--gold": "#F6DDBF", "--gold-ink": "#F2C6AE", "--kina": "#F0957A", "--btn": "#F6DDBF",
      "--btn-ink": "#5A2515",
    },
    og: { bg: "#8A3B24", bg2: "#A54B2F", frame: "#F6DDBF", text: "#FFF4EC", accent: "#F6DDBF" },
  },
  {
    id: "cay",
    label: "Demli çay",
    hint: "Çay kızılı & altın",
    // Tavşan kanı çayın rengi: buluşmalar ve sofralar
    swatch: ["#5C1A12", "#EBC27C", "#FAF3EF"],
    light: {
      "--bg": "#FAF3EF", "--card": "#FFFFFF", "--ink": "#2B1611", "--muted": "#6C564F",
      "--line": "#EEDCD5", "--chip": "#F6E8E2", "--velvet": "#5C1A12", "--velvet2": "#7C2617",
      "--gold": "#EBC27C", "--gold-ink": "#7F4B16", "--kina": "#A8452F", "--btn": "#5C1A12",
      "--btn-ink": "#FFFFFF",
    },
    dark: {
      "--bg": "#150B09", "--card": "#21120F", "--ink": "#F7EAE5", "--muted": "#C5A9A0",
      "--line": "#3A2420", "--chip": "#2C1814", "--velvet": "#3E100B", "--velvet2": "#5C1A12",
      "--gold": "#EBC27C", "--gold-ink": "#EFCB8E", "--kina": "#F0957A", "--btn": "#EBC27C",
      "--btn-ink": "#3E100B",
    },
    og: { bg: "#5C1A12", bg2: "#7C2617", frame: "#EBC27C", text: "#FBEEE0", accent: "#EBC27C" },
  },
];

export const DEFAULT_THEME = THEMES[0].id;
export const isTheme = (v: string) => THEMES.some((t) => t.id === v);
export const themeOf = (id: string | undefined) => THEMES.find((t) => t.id === id) ?? THEMES[0];
