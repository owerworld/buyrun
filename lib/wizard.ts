/**
 * Davet sihirbazı: tek tek soru, cevaba göre dallanma.
 *
 * Kural: her soru TEK DOKUNUŞ ile geçilir, yazı yazdırmaz. Yazı yazdıran adımlar
 * (isim, tarih, yer) sihirbazın sonunda, tek sayfada toplanır. Huninin en çok
 * kaybettiği yer klavye; zevk soruları hızlı akmalı.
 *
 * Cevaplar iki işe yarar:
 *  1) Tema, kapak ve ton seçimi (kural tabanlı — AI olmadan da çalışır)
 *  2) AI'a verilecek bağlam (davet metnini cevaplara göre yazar)
 */

export type Answers = Record<string, string>;

export interface Option {
  id: string;
  label: string;
  /** Seçeneğin altında küçük açıklama */
  hint?: string;
  /** Seçenek yalnızca koşul sağlanırsa gösterilir (ör. mevlid için "neşeli" dil yok) */
  when?: (a: Answers) => boolean;
}

/**
 * Sorunun nasıl gösterileceği. Metin listesi yerine görsel seçim kartları:
 * renk örnekleri, süsleme örneği, yazı karakteri örneği ya da kapak görseli.
 */
export type Look = "liste" | "kutular" | "renk" | "susleme" | "yazi" | "kapak";

export interface Question {
  id: string;
  /** Soru başlığı */
  title: string;
  /** Başlığın altındaki kısa cümle */
  lead?: string;
  options: Option[];
  /** Görünüm; boşsa liste */
  look?: Look;
  /** Bu soru yalnızca koşul sağlanırsa sorulur */
  when?: (a: Answers) => boolean;
}

/** Düğün, nişan ve söz aynı "tören" dalında ilerler. */
export const TOREN = ["dugun", "nisan", "soz"];
export const isToren = (a: Answers) => TOREN.includes(a.tur ?? "");

/** Neşeli dilin ve renkli kapağın yakışmadığı günler. */
export const MANEVI = ["mevlid", "iftar", "hac"];
/** "Manevi ve dualı" dilin sunulduğu türler. */
const DUALI = [...TOREN, "kina", "sunnet", "disbugdayi", "babyshower", "mevlid", "iftar", "hac", "asker", "evpartisi"];

/** Her türün ilk grubu: ana sayfadan türle gelen kullanıcıda grup kendiliğinden dolar. */
const GRUP_OF: Record<string, string> = {
  dugun: "evlilik", nisan: "evlilik", soz: "evlilik", kina: "evlilik", bekarlik: "evlilik",
  sunnet: "cocuk", babyshower: "cocuk", cinsiyet: "cocuk", disbugdayi: "cocuk", dogumgunu: "cocuk",
  mevlid: "manevi", iftar: "manevi", hac: "manevi",
  evpartisi: "dostlar", yemek: "dostlar", mezuniyet: "dostlar", asker: "dostlar", bulusma: "dostlar",
};

/** Tür listesini seçilen gruba göre süzer. Grup sorulmadıysa (ana sayfadan türle gelindiyse) hepsi geçerli. */
function grupta(...gruplar: string[]) {
  return (a: Answers) => !a.grup || gruplar.includes(a.grup);
}

/** Bir sorunun bu cevaplarla gösterilecek seçenekleri. */
export const visibleOptions = (q: Question, a: Answers) => q.options.filter((o) => !o.when || o.when(a));

export const QUESTIONS: Question[] = [
  {
    id: "grup",
    title: "Ne kutluyoruz?",
    lead: "Buradan sonrası size göre şekillenecek.",
    look: "kutular",
    options: [
      { id: "evlilik", label: "Evlilik yolunda", hint: "Düğün, nişan, söz, kına" },
      { id: "cocuk", label: "Çocuk ve bebek", hint: "Sünnet, baby shower, diş buğdayı" },
      { id: "manevi", label: "Manevi günler", hint: "Mevlid, iftar, hac uğurlaması" },
      { id: "dostlar", label: "Dostlarla", hint: "Ev, yemek, mezuniyet, asker" },
    ],
  },
  {
    id: "tur",
    title: "Hangisi?",
    look: "kutular",
    options: [
      { id: "dugun", label: "Düğün", hint: "Nikâh ve düğün", when: grupta("evlilik") },
      { id: "nisan", label: "Nişan", when: grupta("evlilik") },
      { id: "soz", label: "Söz", when: grupta("evlilik") },
      { id: "kina", label: "Kına gecesi", hint: "Tek başına kına daveti", when: grupta("evlilik") },
      { id: "bekarlik", label: "Bekârlığa veda", hint: "Bride party", when: grupta("evlilik") },
      { id: "sunnet", label: "Sünnet düğünü", when: grupta("cocuk") },
      { id: "babyshower", label: "Baby shower", when: grupta("cocuk") },
      { id: "cinsiyet", label: "Cinsiyet partisi", when: grupta("cocuk") },
      { id: "disbugdayi", label: "Diş buğdayı", when: grupta("cocuk") },
      { id: "dogumgunu", label: "Doğum günü", when: grupta("cocuk", "dostlar") },
      { id: "mevlid", label: "Mevlid", when: grupta("manevi") },
      { id: "iftar", label: "İftar yemeği", when: grupta("manevi") },
      { id: "hac", label: "Hac / umre uğurlaması", when: grupta("manevi") },
      { id: "evpartisi", label: "Yeni ev", hint: "Ev partisi, ev hayırlısı", when: grupta("dostlar") },
      { id: "yemek", label: "Akşam yemeği", when: grupta("dostlar") },
      { id: "mezuniyet", label: "Mezuniyet", when: grupta("dostlar") },
      { id: "asker", label: "Asker uğurlaması", when: grupta("dostlar") },
      { id: "bulusma", label: "Buluşma", when: grupta("dostlar") },
    ],
  },
  {
    id: "vesile",
    title: "Mevlid ne vesilesiyle okunacak?",
    lead: "Davet metni buna göre yazılacak.",
    when: (a) => a.tur === "mevlid",
    options: [
      { id: "bebek", label: "Bebeğimiz için" },
      { id: "ev", label: "Yeni evimiz için" },
      { id: "rahmetli", label: "Rahmetlimizin anısına" },
      { id: "sukur", label: "Şükür için", hint: "Hayırlı bir iş, sağlık, kavuşma" },
    ],
  },
  {
    id: "kim",
    title: "Davetliler çoğunlukla kim?",
    lead: "Davet metninin dili buna göre değişecek.",
    options: [
      { id: "buyukler", label: "Büyükler ve akrabalar", hint: "Saygılı, resmî bir dil" },
      { id: "karisik", label: "Karışık", hint: "Herkese uyan bir dil" },
      { id: "arkadaslar", label: "Arkadaşlar", hint: "Samimi, rahat bir dil" },
    ],
  },
  {
    id: "ton",
    title: "Davetiniz nasıl konuşsun?",
    options: [
      { id: "zarif", label: "Zarif ve ölçülü", hint: "“Sizleri aramızda görmekten onur duyarız.”" },
      { id: "sicak", label: "Sıcak ve içten", hint: "“Bu güzel günde yanımızda olmanızı çok isteriz.”" },
      { id: "neseli", label: "Neşeli ve esprili", hint: "“Pistte yeriniz hazır, kaçmak yok!”", when: (a) => !MANEVI.includes(a.tur ?? "") },
      { id: "manevi", label: "Manevi ve dualı", hint: "“Allah'ın izniyle… Hayır dualarınızı bekleriz.”", when: (a) => DUALI.includes(a.tur ?? "") },
    ],
  },
  {
    id: "aile",
    title: "Davetiyede ailelerinizin adı yer alsın mı?",
    lead: "Türkiye'de davetlilerin çoğu çifti aileleri üzerinden tanır; büyükler de bunu bekler.",
    when: isToren,
    options: [
      { id: "evet", label: "Evet, iki ailenin adıyla", hint: "Geleneksel: “Ayşe & Ahmet Yılmaz” gibi" },
      { id: "hayir", label: "Hayır, sadece bizim adımız", hint: "Modern ve sade" },
    ],
  },
  {
    id: "renk",
    title: "Hangi renkler size daha yakın?",
    lead: "İçinizden geleni seçin; davetiye bu renklere bürünecek.",
    look: "renk",
    when: isToren,
    options: [
      { id: "lal", label: "Kına kırmızısı", hint: "Al & altın" },
      { id: "klasik", label: "Bordo", hint: "Bordo & altın" },
      { id: "gul", label: "Pudra gül", hint: "Gül kurusu & bakır" },
      { id: "zumrut", label: "Zümrüt", hint: "Zümrüt & altın" },
      { id: "gece", label: "Gece mavisi", hint: "Lacivert & altın" },
      { id: "krem", label: "Toprak", hint: "Kum & zeytin" },
      { id: "inci", label: "İnci", hint: "Fildişi & siyah" },
      { id: "turkuaz", label: "İznik", hint: "Kobalt, turkuaz & mercan" },
      { id: "sizsecin", label: "Siz seçin", hint: "Diğer cevaplarıma göre" },
    ],
  },
  {
    id: "stil",
    title: "Davetiyeniz hangi ruhu taşısın?",
    lead: "Çerçevenin süslemesi buna göre değişecek.",
    look: "susleme",
    when: isToren,
    options: [
      { id: "klasik", label: "Klasik ve görkemli", hint: "Sırma işi, varak havası" },
      { id: "romantik", label: "Romantik", hint: "Çiçek dalları" },
      { id: "sade", label: "Minimal", hint: "İnce çizgi, süssüz" },
      { id: "modern", label: "Modern lüks", hint: "Art deco" },
      { id: "bohem", label: "Rustik ve doğal", hint: "Defne dalı" },
      { id: "cini", label: "Geleneksel Türk motifi", hint: "Çini, lale" },
      { id: "bilmiyorum", label: "Karar veremedim", hint: "Siz seçin" },
    ],
  },
  {
    id: "yazi",
    title: "İsimleriniz nasıl yazılsın?",
    look: "yazi",
    when: isToren,
    options: [
      { id: "kaligrafi", label: "El yazısı" },
      { id: "klasik", label: "Zarif" },
      { id: "gorkemli", label: "Görkemli" },
      { id: "siir", label: "Şiirsel" },
      { id: "modern", label: "Modern" },
      { id: "sizsecin", label: "Siz seçin" },
    ],
  },
  {
    id: "hava",
    title: "Nasıl bir hava olsun?",
    lead: "Davetinizin kapağı buna göre seçilecek.",
    look: "kapak",
    when: (a) => !isToren(a) && !MANEVI.includes(a.tur ?? ""),
    options: [
      { id: "cosku", label: "Coşkulu ve renkli" },
      { id: "sicakhava", label: "Küçük ve samimi" },
      { id: "sik", label: "Şık ve sakin" },
    ],
  },
  {
    id: "ikinci",
    title: "Tek gün mü, iki gün mü?",
    lead: "Kına gecesi, ayrı günde nikâh ya da after party ekleyebilirsiniz.",
    when: isToren,
    options: [
      { id: "tek", label: "Tek gün" },
      { id: "kina", label: "Kına gecesi de var" },
      { id: "nikah", label: "Nikâh ayrı bir günde", hint: "Belediyede nikâh, başka gün düğün", when: (a) => a.tur === "dugun" },
      { id: "after", label: "After party de var" },
    ],
  },
  {
    // Servis ve program tek soruda: bilgi kaybetmeden bir dokunuş eksik
    id: "ekler",
    title: "Davetiyede başka neler olsun?",
    lead: "Türkiye'de düğünlerin çoğunda servis kalkar, program da merak edilir.",
    when: isToren,
    options: [
      { id: "ikisi", label: "Servis ve günün programı", hint: "Kalkış yeri ve saati; gelin alma, nikâh, takı merasimi" },
      { id: "servis", label: "Sadece servis bilgisi" },
      { id: "program", label: "Sadece günün programı" },
      { id: "yok", label: "Hiçbiri, sade kalsın" },
    ],
  },
  {
    id: "istek",
    title: "Davetlilerden bir isteğiniz var mı?",
    when: (a) => !isToren(a),
    options: [
      { id: "yok", label: "Hayır, sadece gelsinler" },
      { id: "getir", label: "Yanlarında bir şey getirsinler" },
      { id: "kiyafet", label: "Kıyafet konusunda bir not var" },
    ],
  },
  {
    id: "kalabalik",
    title: "Kaç kişilik bir davet?",
    lead: "Kesin olması gerekmiyor, kabaca yeter.",
    options: [
      { id: "kucuk", label: "20 kişiye kadar", when: (a) => !isToren(a) },
      { id: "orta", label: "20 – 100 kişi", when: (a) => !isToren(a) },
      { id: "yuz", label: "100 kişiye kadar", when: isToren },
      { id: "buyuk", label: "100 – 300 kişi" },
      { id: "ucyuz", label: "300 – 500 kişi", when: isToren },
      { id: "cokbuyuk", label: "300 kişiden fazla", when: (a) => !isToren(a) },
      { id: "besyuz", label: "500 kişiden fazla", when: isToren },
    ],
  },
];

/** Cevaplara göre sorulacak soruları sırayla verir. */
export const askable = (a: Answers) => QUESTIONS.filter((q) => !q.when || q.when(a));

/** Sırada hangi soru var? Hepsi cevaplandıysa null. */
export function nextQuestion(a: Answers): Question | null {
  return askable(a).find((q) => !a[q.id]) ?? null;
}

/** Kaçıncı sorudayız / toplam kaç soru var? */
export function progress(a: Answers) {
  const list = askable(a);
  const done = list.filter((q) => a[q.id]).length;
  return { done, total: list.length };
}

/** Bir sorunun geçerli cevabı mı? Adres satırından gelen değer doğrulanır. */
export function isValidAnswer(questionId: string, value: string) {
  return QUESTIONS.find((q) => q.id === questionId)?.options.some((o) => o.id === value) ?? false;
}

/* ------------------------------------------------------------------ */
/* Cevaplardan çıkan plan                                             */
/* ------------------------------------------------------------------ */

/** Cevapların tasarıma ve veri modeline çevrilmiş hâli. AI olmadan da doludur. */
export interface Plan {
  /** Tören dalı mı (düğün/nişan/söz), yoksa genel etkinlik mi? */
  toren: boolean;
  /** Tören dalı: ana tören türü (lib/events.ts) */
  mainKind: string;
  /** Tören dalı: ikinci etkinlik türü — yoksa boş */
  extraKind: string;
  /** Tören dalı: davetiye teması (lib/themes.ts) */
  theme: string;
  /** Tören dalı: isimlerin yazı karakteri (lib/design.ts) */
  font: string;
  /** Tören dalı: çerçeve süslemesi (lib/design.ts) */
  ornament: string;
  /** Etkinlik dalı: kapak (components/CoverPicker.tsx) */
  coverId: string;
  /** Etkinlik dalı: kategori (lib/categories.ts) */
  category: string;
  /** Servis bilgisi sorulacak mı? */
  wantsBus: boolean;
  /** Günün programı sorulacak mı? */
  wantsProgram: boolean;
  /** Davetlilerden bir istek var mı? "", "getir" ya da "kiyafet" */
  request: string;
  /** Tören dalı: iki ailenin adı davetiyede yazılsın mı? */
  families: boolean;
  /** Tören dalı: isimlerin üstündeki açılış satırı */
  opening: string;
}

const CATEGORY_OF: Record<string, string> = {
  dugun: "Düğün", nisan: "Düğün", soz: "Düğün",
  kina: "Kına gecesi", bekarlik: "Bekârlığa veda", dogumgunu: "Doğum günü", mezuniyet: "Mezuniyet",
  evpartisi: "Ev partisi", yemek: "Akşam yemeği", bulusma: "Buluşma",
  sunnet: "Sünnet", babyshower: "Baby shower", cinsiyet: "Cinsiyet partisi", disbugdayi: "Diş buğdayı",
  mevlid: "Mevlid", iftar: "İftar", hac: "Hac uğurlaması", asker: "Asker uğurlaması",
};

const PALETLER = ["lal", "klasik", "gul", "zumrut", "gece", "krem", "inci", "turkuaz"];

/**
 * Tören dalında üç eksen ayrı ayrı seçilir. Açık cevap her zaman kazanır;
 * "siz seçin" dendiğinde eksik eksen diğer cevaplardan türetilir.
 */
function themeFor(a: Answers) {
  if (PALETLER.includes(a.renk ?? "")) return a.renk;
  const fromStil: Record<string, string> = { klasik: "klasik", romantik: "gul", sade: "inci", modern: "gece", bohem: "krem", cini: "turkuaz" };
  if (fromStil[a.stil ?? ""]) return fromStil[a.stil];
  if (a.ton === "zarif") return "krem";
  if (a.ton === "neseli") return "lal";
  if (a.ton === "manevi") return "zumrut";
  return "klasik";
}

function ornamentFor(a: Answers, theme: string) {
  const fromStil: Record<string, string> = { klasik: "sirma", romantik: "cicek", sade: "cizgi", modern: "deco", bohem: "yaprak", cini: "cini" };
  if (fromStil[a.stil ?? ""]) return fromStil[a.stil];
  const fromTheme: Record<string, string> = { lal: "sirma", klasik: "sirma", gul: "cicek", zumrut: "deco", gece: "deco", krem: "yaprak", inci: "cizgi", turkuaz: "cini" };
  return fromTheme[theme] ?? "sirma";
}

function fontFor(a: Answers, ornament: string) {
  if (["kaligrafi", "klasik", "gorkemli", "siir", "modern"].includes(a.yazi ?? "")) return a.yazi;
  const fromOrnament: Record<string, string> = { sirma: "gorkemli", cicek: "kaligrafi", cizgi: "klasik", deco: "modern", yaprak: "siir", cini: "gorkemli" };
  if (a.ton === "neseli" && ornament !== "deco") return "kaligrafi";
  return fromOrnament[ornament] ?? "klasik";
}

/** Etkinlik dalında kapak: istenen hava her zaman kazanır; henüz sorulmadıysa türün doğal karşılığı. */
function coverFor(a: Answers) {
  if (a.hava === "cosku") return "cherry";
  if (a.hava === "sik") return "midnight";
  if (a.hava === "sicakhava") return "bloom";
  if (a.tur === "iftar") return "midnight";
  if (MANEVI.includes(a.tur ?? "")) return "bloom";
  if (["dogumgunu", "evpartisi", "bekarlik", "sunnet", "asker"].includes(a.tur ?? "")) return "cherry";
  if (a.tur === "yemek" || a.tur === "bulusma") return "midnight";
  return "bloom";
}

/** Kapağın en üstündeki kısa satır; dilin tonunu ilk bakışta verir. */
export function openingFor(a: Answers) {
  if (a.ton === "manevi") return "Allah'ın izniyle";
  if (a.ton === "sicak") return "Bu mutlu günümüzde";
  if (a.ton === "neseli") {
    if (a.tur === "nisan") return "Sonunda nişanlanıyoruz!";
    if (a.tur === "soz") return "Söz kesildi!";
    return "Sonunda evleniyoruz!";
  }
  return "Mutluluğumuza ortak olun";
}

export function planFromAnswers(a: Answers): Plan {
  const toren = isToren(a);
  const theme = themeFor(a);
  const ornament = ornamentFor(a, theme);
  return {
    toren,
    mainKind: toren ? a.tur : "",
    extraKind: ["kina", "nikah", "after"].includes(a.ikinci ?? "") ? a.ikinci : "",
    theme, ornament,
    font: fontFor(a, ornament),
    coverId: coverFor(a),
    category: CATEGORY_OF[a.tur ?? ""] ?? "Buluşma",
    wantsBus: toren && (a.ekler === "ikisi" || a.ekler === "servis"),
    wantsProgram: toren && (a.ekler === "ikisi" || a.ekler === "program"),
    request: !toren && a.istek && a.istek !== "yok" ? a.istek : "",
    families: toren && a.aile === "evet",
    opening: openingFor(a),
  };
}

/** Cevapları AI'ın okuyabileceği düz Türkçe satırlara çevirir. */
export function answerSummary(a: Answers): string[] {
  return askable(a)
    .filter((q) => a[q.id])
    .map((q) => {
      const opt = q.options.find((o) => o.id === a[q.id]);
      return `${q.title} → ${opt?.label ?? a[q.id]}${opt?.hint ? ` (${opt.hint})` : ""}`;
    });
}

/* ------------------------------------------------------------------ */
/* Adres satırı                                                        */
/* ------------------------------------------------------------------ */

/** Adres satırındaki (ya da formdaki) değerlerden yalnızca geçerli cevapları alır. */
export function parseAnswers(src: Record<string, string | string[] | undefined>): Answers {
  const out: Answers = {};
  for (const q of QUESTIONS) {
    const raw = src[q.id];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value && isValidAnswer(q.id, value)) out[q.id] = value;
  }
  // Tür biliniyor ama grup yoksa (ana sayfa linki, mobil uygulama) grubu türden çıkar
  if (out.tur && !out.grup && GRUP_OF[out.tur]) out.grup = GRUP_OF[out.tur];
  return out;
}

/** Cevapları adres satırına yazar. Sorulmayan dalın cevapları düşer. */
export function answersQuery(a: Answers) {
  const p = new URLSearchParams();
  for (const q of askable(a)) if (a[q.id]) p.set(q.id, a[q.id]);
  return p.toString();
}

/** Son cevaplanan soruyu siler — "geri" bağlantısı için. */
export function withoutLast(a: Answers): Answers {
  const answered = askable(a).filter((q) => a[q.id]);
  const last = answered[answered.length - 1];
  if (!last) return {};
  const copy = { ...a };
  delete copy[last.id];
  return copy;
}
