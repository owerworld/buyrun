/**
 * Davetiyenin tasarım eksenleri.
 *
 * Renk paleti lib/themes.ts'te. Burada kalan iki eksen var: isimlerin yazı karakteri
 * ve çerçevenin süslemesi. Üçü birbirinden bağımsız seçilir; sihirbazın cevapları
 * her birini ayrı ayrı belirler, böylece 8 × 6 × 5 = 240 farklı davetiye çıkar.
 *
 * Değerler sabit listelerden gelir; kullanıcı metni asla CSS'e girmez.
 */

export interface FontStyle {
  id: string;
  label: string;
  hint: string;
  /** Seçim kartındaki örnek yazının stili */
  sample: { fontFamily: string; fontWeight: number; fontStyle?: "italic"; letterSpacing?: string; textTransform?: "uppercase"; fontSize?: string };
}

export const FONTS: FontStyle[] = [
  { id: "klasik", label: "Zarif", hint: "İnce, klasik harfler",
    sample: { fontFamily: "var(--font-display),serif", fontWeight: 500 } },
  { id: "kaligrafi", label: "El yazısı", hint: "Kaligrafi, akıcı",
    sample: { fontFamily: "var(--font-vibes),cursive", fontWeight: 400, fontSize: "1.4em" } },
  { id: "gorkemli", label: "Görkemli", hint: "Güçlü, kontrastlı",
    sample: { fontFamily: "var(--font-playfair),serif", fontWeight: 500 } },
  { id: "modern", label: "Modern", hint: "İnce, geniş aralıklı",
    sample: { fontFamily: "var(--font-josefin),sans-serif", fontWeight: 300, letterSpacing: ".14em", textTransform: "uppercase", fontSize: ".8em" } },
  { id: "siir", label: "Şiirsel", hint: "Eğik, yumuşak",
    sample: { fontFamily: "var(--font-display),serif", fontWeight: 400, fontStyle: "italic" } },
];

export interface Ornament {
  id: string;
  label: string;
  hint: string;
}

export const ORNAMENTS: Ornament[] = [
  { id: "sirma", label: "Sırma işi", hint: "Geleneksel motif" },
  { id: "cicek", label: "Çiçek dalları", hint: "Köşelerde çiçek" },
  { id: "cizgi", label: "İnce çizgi", hint: "Süssüz, sade" },
  { id: "deco", label: "Art deco", hint: "Geometrik, şık" },
  { id: "yaprak", label: "Defne dalı", hint: "Doğal, bohem" },
  { id: "cini", label: "Çini lale", hint: "Geleneksel Türk motifi" },
];

export const DEFAULT_FONT = "klasik";
export const DEFAULT_ORNAMENT = "sirma";
export const isFont = (v: string) => FONTS.some((f) => f.id === v);
export const isOrnament = (v: string) => ORNAMENTS.some((o) => o.id === v);
export const fontOf = (id: string | undefined) => FONTS.find((f) => f.id === id) ?? FONTS[0];
export const ornamentOf = (id: string | undefined) => ORNAMENTS.find((o) => o.id === id) ?? ORNAMENTS[0];

/* ------------------------------------------------------------------ */
/* Arka plan dokusu                                                    */
/* ------------------------------------------------------------------ */

/**
 * Kapağın arkasındaki doku. Türkiye'de davetiyelerde sevilen dokular ve geleneksel
 * motifler; her birinin halk arasında bilinen bir anlamı var, seçim kartında yazar.
 * Desenler public/desen altında tek renkli SVG; renklerini temadan (--gold) alırlar.
 * "tile" doku tekrar eden boyut (px); yoksa kapağı bir kez kaplar.
 */
export interface Pattern {
  id: string;
  label: string;
  hint: string;
  tile?: number;
}

export const PATTERNS: Pattern[] = [
  { id: "sade", label: "Sade", hint: "Dokusuz, yalnızca renk" },
  { id: "mermer", label: "Mermer", hint: "Modern ve şık" },
  { id: "varak", label: "Altın varak", hint: "Görkemli, ışıltılı", tile: 160 },
  { id: "cicekli", label: "Çiçekli", hint: "Romantik, en çok sevilen", tile: 180 },
  { id: "dantel", label: "Dantel ve oya", hint: "Gelinliğin, çeyizin inceliği", tile: 56 },
  { id: "cini", label: "Çini", hint: "Lale ve karanfil", tile: 84 },
  { id: "yildiz", label: "Selçuklu yıldızı", hint: "Mutluluk, bereket, sonsuzluk", tile: 70 },
  { id: "nar", label: "Nar", hint: "Bereket ve bolluk", tile: 130 },
  { id: "ebru", label: "Ebru", hint: "UNESCO mirası Türk sanatı" },
  { id: "bindalli", label: "Bindallı sırması", hint: "Kına gecesinin altın işlemesi", tile: 120 },
  { id: "nazar", label: "Nazar", hint: "Maşallah, nazardan korusun", tile: 60 },
  { id: "fener", label: "Hilal ve fener", hint: "Ramazan'ın ışığı", tile: 130 },
  // Konsepte özel dokular: her davet türü kendi dünyasından seçer
  { id: "puantiye", label: "Puantiye", hint: "Tatlı ve oyuncu", tile: 36 },
  { id: "konfeti", label: "Konfeti", hint: "Parti havası", tile: 140 },
  { id: "balon", label: "Balonlar", hint: "Kutlamanın neşesi", tile: 150 },
  { id: "bulut", label: "Bulut ve yıldız", hint: "Bebek odası gibi", tile: 160 },
  { id: "basak", label: "Buğday başağı", hint: "Diş buğdayının bereketi", tile: 140 },
  { id: "kep", label: "Mezuniyet kepi", hint: "Emeğin taçlandığı gün", tile: 140 },
  { id: "ayyildiz", label: "Ay yıldız", hint: "Vatan sana emanet", tile: 120 },
  { id: "gul", label: "Gül", hint: "Gül kokulu meclis", tile: 130 },
  { id: "tac", label: "Şehzade tacı", hint: "Şehzademizin büyük günü", tile: 130 },
  { id: "kilim", label: "Kilim", hint: "Anadolu'nun sıcaklığı", tile: 96 },
  { id: "cay", label: "İnce belli çay", hint: "Çayı demledik, buyurun", tile: 130 },
  { id: "kalp", label: "Kalpler", hint: "Sevgiyle", tile: 100 },
];

export const DEFAULT_PATTERN = "sade";
export const isPattern = (v: string) => PATTERNS.some((p) => p.id === v);
export const patternOf = (id: string | undefined) => PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
