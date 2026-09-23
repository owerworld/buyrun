/**
 * Davet sihirbazı — mobil sürüm.
 *
 * Web'deki lib/wizard.ts ile aynı fikir, uygulamanın veri modeline uyarlanmış hâli:
 * burada tek ev sahibi ve tek gün var, o yüzden iki aile / ikinci etkinlik soruları yok.
 * Soru metinleri iki tarafta da aynı kalsın, kullanıcı hangisinden girerse girsin
 * aynı deneyimi görsün.
 *
 * Kural: her soru tek dokunuş. İsim, tarih ve mekân sihirbazdan sonra, tanıdık
 * oluşturma formunda alınır.
 */

import { covers, type CoverId } from "./theme";

export type Answers = Record<string, string>;
export interface Option {
  id: string;
  label: string;
  hint?: string;
  /** Seçenek yalnızca koşul sağlanırsa gösterilir */
  when?: (a: Answers) => boolean;
  /** Açıklama türe göre değişiyorsa (ton örnekleri) */
  hintOf?: (a: Answers) => string | undefined;
}
export interface Question {
  id: string;
  title: string;
  lead?: string;
  options: Option[];
  when?: (a: Answers) => boolean;
}

/** Düğünde "hava" yerine "stil" sorulur. Soru sözlüğü web'dekiyle birebir aynı
 *  kalmalı: davet metnini yazan sunucu cevapları web'in listesine göre doğruluyor. */
const TOREN = ["dugun"];
export const isToren = (a: Answers) => TOREN.includes(a.tur ?? "");
/** Renkli, coşkulu kapağın yakışmadığı günler: "hava" sorulmaz, neşeli dil sunulmaz. */
const MANEVI = ["mevlid", "iftar"];
/** "Manevi ve dualı" dilin sunulduğu türler (web'deki listeyle aynı). */
const DUALI = ["dugun", "kina", "sunnet", "disbugdayi", "babyshower", "mevlid", "iftar", "asker", "evpartisi"];

type Ton = "zarif" | "sicak" | "neseli" | "manevi";
/**
 * Ton seçeneklerinin altındaki örnek, davetin türüne göre (web'deki lib/sozler.ts
 * ile aynı cümleler): mezuniyette "kepler havaya uçacak", askerde "yolu açık olsun".
 */
const TON_ORNEK: Record<string, Partial<Record<Ton, string>>> = {
  dugun: { zarif: "Sizleri aramızda görmekten onur duyarız.", sicak: "Bu güzel günde yanımızda olmanızı çok isteriz.", neseli: "Pistte yeriniz hazır, kaçmak yok!", manevi: "Allah'ın izniyle… Hayır dualarınızı bekleriz." },
  kina: { zarif: "Gelinimizin kınası yakılacak.", sicak: "Kınalar yakılacak, türküler söylenecek.", neseli: "Çalsın davullar, oynasın kızlar!", manevi: "Allah'ın izniyle kınamız yakılacak." },
  sunnet: { zarif: "Oğlumuzun sünnet düğününe teşriflerinizi bekleriz.", sicak: "Bir sünnet, bir bayram, bir dua…", neseli: "Büyüdüm artık maşallah, çocukluğuma eyvallah!", manevi: "Allah'ın izniyle oğlumuzu sünnet ettiriyoruz." },
  babyshower: { zarif: "Minik misafirimizi birlikte bekleyelim.", sicak: "Minik ayaklar yolda!", neseli: "Bebek geliyor, parti başlıyor!", manevi: "Allah'ın izniyle minik bir can aramıza katılıyor." },
  disbugdayi: { zarif: "İlk dişin sevincini paylaşmak isteriz.", sicak: "Minik incimiz göründü!", neseli: "Makas mı, kalem mi? Bebeğimiz mesleğini seçiyor!", manevi: "İlk dişi çıktı, maşallah! Dualarınızı bekleriz." },
  dogumgunu: { zarif: "Yeni yaşı sevdiklerle karşılayalım.", sicak: "Yeni bir yaş, yeni bir sayfa!", neseli: "Mumları saymayın, sadece gelin!" },
  mevlid: { zarif: "Mevlid-i Şerif'e teşriflerinizi rica ederiz.", sicak: "Şerbetimiz, lokumumuz sizi bekliyor.", manevi: "Dualarınızla aramızda olmanızı dileriz." },
  iftar: { zarif: "Sofralarımızı sizinle paylaşmak isteriz.", sicak: "Bir hurma, bir yudum su, bol muhabbet.", manevi: "Oruçlarınız kabul olsun, iftarımıza buyurun." },
  asker: { zarif: "Yiğidimizi vatan hizmetine uğurluyoruz.", sicak: "Yolu açık, bahtı açık olsun!", neseli: "Tezkereye kadar yok; son halayı birlikte çekelim!", manevi: "Allah'a emanet, dualarla uğurlayalım." },
  evpartisi: { zarif: "Yeni yuvamızda sizi ağırlamak isteriz.", sicak: "Çayımız demlendi, kapımız açık.", neseli: "Kolileri açtık (çoğunu!), sıra kutlamada!", manevi: "Evimiz hayırlı olsun; dualarınızla buyurun." },
  yemek: { zarif: "Sofralarımızı sizinle paylaşmak isteriz.", sicak: "Sofra kuruldu, çay demde, muhabbet hazır.", neseli: "Diyetler bir akşamlığına iptal!" },
  mezuniyet: { zarif: "Yılların emeği bir diplomada buluştu.", sicak: "Okul bitti, hayat başlıyor!", neseli: "Kepler havaya uçacak, siz de orada olun!" },
  bulusma: { zarif: "Güzel bir buluşmada görüşmek isteriz.", sicak: "Özledik! Bir çay içimi muhabbet.", neseli: "Bahaneler kabul edilmiyor!" },
};
export function tonOrnegi(tur: string | undefined, ton: string) {
  const s = (TON_ORNEK[tur ?? ""] ?? TON_ORNEK.dugun)[ton as Ton];
  return s ? `“${s}”` : undefined;
}

/** Tür seçilince görünen karşılık (web'dekiyle aynı). */
export const TUR_TEPKI: Record<string, string> = {
  dugun: "Bir ömür mutluluk! Düğününe yakışır bir davet hazırlayalım.",
  kina: "Kınalar yakılsın! Gecene yakışan bir davet hazırlıyoruz.",
  sunnet: "Maşallah! Şehzadene yakışan bir davet hazırlayalım.",
  babyshower: "Minik ayaklar yolda! Tatlı bir davet geliyor.",
  disbugdayi: "Maşallah, ilk diş! Buğdaylar kaynasın.",
  dogumgunu: "Nice mutlu yaşlara! Kutlamaya yakışan bir davet hazırlayalım.",
  mevlid: "Allah kabul etsin. Gül kokulu, sade bir davet hazırlayalım.",
  iftar: "Hayırlı Ramazanlar! Sofrana yakışan bir davet geliyor.",
  asker: "Yolu açık olsun! Uğurlamaya yakışan bir davet hazırlayalım.",
  evpartisi: "Hayırlı olsun! Yeni evine ilk misafirleri çağıralım.",
  yemek: "Afiyet olsun şimdiden! Sofrana davet hazırlıyoruz.",
  mezuniyet: "Tebrikler! Emeklerin kutlanacağı bir davet hazırlayalım.",
  bulusma: "Özlem giderelim! Buluşmaya çağıralım.",
};

/**
 * Türün ilk kapak fotoğrafı. Fotoğraflar sunucudan gelir (/foto/<id>.jpg, CC0,
 * telifsiz); liste web'deki lib/fotolar.ts ile aynı, /api/foto?tur= ile tamamı alınır.
 */
const ILK_FOTO: Record<string, string> = {
  kina: "kina-1", sunnet: "sunnet-1", babyshower: "babyshower-1", disbugdayi: "disbugdayi-1",
  dogumgunu: "dogumgunu-1", mevlid: "mevlid-1", iftar: "iftar-1", asker: "asker-1",
  evpartisi: "evpartisi-1", yemek: "yemek-1", mezuniyet: "mezuniyet-1", bulusma: "bulusma-3",
};

export const QUESTIONS: Question[] = [
  {
    id: "tur",
    title: "Ne kutluyoruz?",
    lead: "Buradan sonrası sana göre şekillenecek.",
    options: [
      { id: "dogumgunu", label: "Doğum günü" },
      { id: "yemek", label: "Akşam yemeği" },
      { id: "dugun", label: "Düğün" },
      { id: "kina", label: "Kına gecesi" },
      { id: "evpartisi", label: "Ev partisi" },
      { id: "mezuniyet", label: "Mezuniyet" },
      { id: "bulusma", label: "Buluşma" },
      { id: "sunnet", label: "Sünnet düğünü" },
      { id: "babyshower", label: "Baby shower" },
      { id: "disbugdayi", label: "Diş buğdayı" },
      { id: "mevlid", label: "Mevlid" },
      { id: "iftar", label: "İftar yemeği" },
      { id: "asker", label: "Asker uğurlaması" },
    ],
  },
  {
    id: "kim",
    title: "Davetliler çoğunlukla kim?",
    lead: "Davet metninin dili buna göre değişecek.",
    options: [
      {
        id: "buyukler",
        label: "Büyükler ve akrabalar",
        hint: "Saygılı, resmî bir dil",
      },
      { id: "karisik", label: "Karışık", hint: "Herkese uyan bir dil" },
      { id: "arkadaslar", label: "Arkadaşlar", hint: "Samimi, rahat bir dil" },
    ],
  },
  {
    id: "ton",
    title: "Davetin nasıl konuşsun?",
    options: [
      { id: "zarif", label: "Zarif ve ölçülü", hintOf: (a) => tonOrnegi(a.tur, "zarif") },
      { id: "sicak", label: "Sıcak ve içten", hintOf: (a) => tonOrnegi(a.tur, "sicak") },
      {
        id: "neseli",
        label: "Neşeli ve esprili",
        hintOf: (a) => tonOrnegi(a.tur, "neseli"),
        when: (a) => !MANEVI.includes(a.tur ?? ""),
      },
      {
        id: "manevi",
        label: "Manevi ve dualı",
        hintOf: (a) => tonOrnegi(a.tur, "manevi"),
        when: (a) => DUALI.includes(a.tur ?? ""),
      },
    ],
  },
  {
    id: "stil",
    title: "Davetiye nasıl görünsün?",
    when: isToren,
    options: [
      { id: "klasik", label: "Klasik ve görkemli" },
      { id: "sade", label: "Sade ve zarif" },
      { id: "modern", label: "Modern ve gece" },
    ],
  },
  {
    id: "hava",
    title: "Nasıl bir hava olsun?",
    when: (a) => !isToren(a) && !MANEVI.includes(a.tur ?? ""),
    options: [
      { id: "cosku", label: "Coşkulu ve renkli" },
      { id: "sicakhava", label: "Küçük ve samimi" },
      { id: "sik", label: "Şık ve sakin" },
    ],
  },
  {
    id: "istek",
    title: "Davetlilerden bir isteğin var mı?",
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
      { id: "kucuk", label: "20 kişiye kadar" },
      { id: "orta", label: "20 – 100 kişi" },
      { id: "buyuk", label: "100 – 300 kişi" },
      { id: "cokbuyuk", label: "300 kişiden fazla" },
    ],
  },
];

/** Sorunun bu cevaplarla gösterilecek seçenekleri; türe bağlı açıklamalar doldurulmuş. */
export const visibleOptions = (q: Question, a: Answers) =>
  q.options
    .filter((o) => !o.when || o.when(a))
    .map((o) => (o.hintOf ? { ...o, hint: o.hintOf(a) ?? o.hint } : o));

export const askable = (a: Answers) =>
  QUESTIONS.filter((q) => !q.when || q.when(a));
export const nextQuestion = (a: Answers) =>
  askable(a).find((q) => !a[q.id]) ?? null;
export function progress(a: Answers) {
  const list = askable(a);
  return { done: list.filter((q) => a[q.id]).length, total: list.length };
}

const CATEGORY_OF: Record<string, string> = {
  dogumgunu: "Doğum günü",
  yemek: "Akşam yemeği",
  dugun: "Düğün",
  kina: "Kına gecesi",
  evpartisi: "Ev partisi",
  mezuniyet: "Mezuniyet",
  sunnet: "Sünnet",
  babyshower: "Baby shower",
  disbugdayi: "Diş buğdayı",
  mevlid: "Mevlid",
  iftar: "İftar",
  asker: "Asker uğurlaması",
  bulusma: "Buluşma",
};

/** Cevaplardan çıkan kapak ve kategori. AI olmasa da davet cevaplara benzer. */
export function planFromAnswers(a: Answers): {
  coverId: CoverId;
  category: string;
  request: string;
  /** Türe uygun kapak fotoğrafı; düğünde boş (çizim kapak) */
  photoId: string;
} {
  // İstenen hava her zaman kazanır; yoksa türün doğal karşılığı (web'deki kuralla aynı)
  let coverId: CoverId = "bloom";
  if (isToren(a))
    coverId =
      a.stil === "modern"
        ? "midnight"
        : a.stil === "klasik"
          ? "cherry"
          : "bloom";
  else if (a.tur === "iftar") coverId = "midnight";
  else if (a.tur === "mevlid") coverId = "bloom";
  else if (a.hava === "cosku") coverId = "cherry";
  else if (a.hava === "sik") coverId = "midnight";
  else if (a.hava === "sicakhava") coverId = "bloom";
  else if (a.tur === "dogumgunu" || a.tur === "evpartisi") coverId = "cherry";
  else if (a.tur === "yemek" || a.tur === "bulusma") coverId = "midnight";
  return {
    coverId: coverId in covers ? coverId : "cherry",
    category: CATEGORY_OF[a.tur ?? ""] ?? "Buluşma",
    request: a.istek && a.istek !== "yok" ? a.istek : "",
    photoId: ILK_FOTO[a.tur ?? ""] ?? "",
  };
}
