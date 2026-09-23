export const C = {
  bg: "#F8F8F5",
  ink: "#202025",
  muted: "#797982",
  line: "#E7E7E3",
  white: "#FFFFFF",
  lime: "#DDFC79",
  purple: "#B9A3F8",
  orange: "#FF7146",
  dark: "#28282F",
  green: "#26734D",
  red: "#AD4949",
  soft: "#EFEFEA",
};
export const F = { regular: "Manrope", bold: "ManropeBold" };
export const covers = {
  cherry: {
    image: require("../../assets/covers/cherry.png"),
    label: "Kiraz gibi",
    category: "Doğum günü",
    color: "#FF7139",
    text: "#FFFFFF",
    caption: "Bir yaş daha.\nBir bahane daha.",
  },
  midnight: {
    image: require("../../assets/covers/midnight.png"),
    label: "Uzun bir akşam",
    category: "Akşam yemeği",
    color: "#1646BA",
    text: "#FFFFFF",
    caption: "Bir masa.\nBir sürü hikâye.",
  },
  bloom: {
    image: require("../../assets/covers/bloom.png"),
    label: "Birlikte güzel",
    category: "Düğün",
    color: "#B9A3F8",
    text: "#26222D",
    caption: "Bizim\nbüyük günümüz.",
  },
};
export type CoverId = keyof typeof covers;
export const categories = [
  "Doğum günü",
  "Akşam yemeği",
  "Düğün",
  "Kına gecesi",
  "Ev partisi",
  "Mezuniyet",
  "Buluşma",
  "Sünnet",
  "Baby shower",
  "Diş buğdayı",
  "Mevlid",
  "İftar",
  "Asker uğurlaması",
];
export const statusLabels = {
  going: "Geliyor",
  maybe: "Belki",
  pending: "Bekleniyor",
  declined: "Gelemiyor",
};
export const statusColors = {
  going: C.green,
  maybe: "#885DA3",
  pending: "#997029",
  declined: C.red,
};
