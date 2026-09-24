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
  /** Başlık türe göre değişiyorsa */
  titleOf?: (a: Answers) => string;
  lead?: string;
  options: Option[];
  when?: (a: Answers) => boolean;
}

/** Düğünde "hava" yerine "stil" sorulur. Soru sözlüğü web'dekiyle birebir aynı
 *  kalmalı: davet metnini yazan sunucu cevapları web'in listesine göre doğruluyor. */
const TOREN = ["dugun"];
export const isToren = (a: Answers) => TOREN.includes(a.tur ?? "");
/** Soru yalnızca bu türlerde sorulur. */
const tur =
  (...t: string[]) =>
  (a: Answers) =>
    t.includes(a.tur ?? "");
/** Havası kendi sorusundan belli olan türler: "Nasıl bir hava olsun?" sorulmaz. */
const HAVASIZ = ["sunnet", "kina", "asker", "evpartisi", "mezuniyet"];
/** Davetin adı, uygulamanın "sen" diliyle: "sünnet davetiyen", "baby shower davetin". */
export function davetAdi(a: Answers) {
  const ad: Record<string, string> = {
    dugun: "düğün davetiyen",
    kina: "kına davetiyen",
    sunnet: "sünnet davetiyen",
    babyshower: "baby shower davetin",
    disbugdayi: "diş buğdayı davetin",
    mevlid: "mevlid davetin",
    iftar: "iftar davetin",
    yemek: "yemek davetin",
    mezuniyet: "mezuniyet davetin",
    bulusma: "buluşma davetin",
  };
  if (a.tur === "dogumgunu")
    return a.surpriz === "evet"
      ? "sürpriz parti davetin"
      : "doğum günü davetin";
  if (a.tur === "asker")
    return a.askyon === "karsilama" ? "hoş geldin davetin" : "uğurlama davetin";
  if (a.tur === "evpartisi")
    return a.evtur === "hayirli"
      ? "ev hayırlısı davetin"
      : "ev partisi davetin";
  return ad[a.tur ?? ""] ?? "davetin";
}
export const buyukHarf = (s: string) =>
  s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
export const soruBasligi = (q: Question, a: Answers) =>
  q.titleOf?.(a) ?? q.title;

/** Renkli, coşkulu kapağın yakışmadığı günler: "hava" sorulmaz, neşeli dil sunulmaz. */
const MANEVI = ["mevlid", "iftar"];
/** "Manevi ve dualı" dilin sunulduğu türler (web'deki listeyle aynı). */
const DUALI = [
  "dugun",
  "kina",
  "sunnet",
  "disbugdayi",
  "babyshower",
  "mevlid",
  "iftar",
  "asker",
  "evpartisi",
];

type Ton = "zarif" | "sicak" | "neseli" | "manevi";
/**
 * Ton seçeneklerinin altındaki örnek, davetin türüne göre (web'deki lib/sozler.ts
 * ile aynı cümleler): mezuniyette "kepler havaya uçacak", askerde "yolu açık olsun".
 */
const TON_ORNEK: Record<string, Partial<Record<Ton, string>>> = {
  dugun: {
    zarif: "Sizleri aramızda görmekten onur duyarız.",
    sicak: "Bu güzel günde yanımızda olmanızı çok isteriz.",
    neseli: "Pistte yeriniz hazır, kaçmak yok!",
    manevi: "Allah'ın izniyle… Hayır dualarınızı bekleriz.",
  },
  kina: {
    zarif: "Gelinimizin kınası yakılacak.",
    sicak: "Kınalar yakılacak, türküler söylenecek.",
    neseli: "Çalsın davullar, oynasın kızlar!",
    manevi: "Allah'ın izniyle kınamız yakılacak.",
  },
  sunnet: {
    zarif: "Oğlumuzun sünnet düğününe teşriflerinizi bekleriz.",
    sicak: "Bir sünnet, bir bayram, bir dua…",
    neseli: "Büyüdüm artık maşallah, çocukluğuma eyvallah!",
    manevi: "Allah'ın izniyle oğlumuzu sünnet ettiriyoruz.",
  },
  babyshower: {
    zarif: "Minik misafirimizi birlikte bekleyelim.",
    sicak: "Minik ayaklar yolda!",
    neseli: "Bebek geliyor, parti başlıyor!",
    manevi: "Allah'ın izniyle minik bir can aramıza katılıyor.",
  },
  disbugdayi: {
    zarif: "İlk dişin sevincini paylaşmak isteriz.",
    sicak: "Minik incimiz göründü!",
    neseli: "Makas mı, kalem mi? Bebeğimiz mesleğini seçiyor!",
    manevi: "İlk dişi çıktı, maşallah! Dualarınızı bekleriz.",
  },
  dogumgunu: {
    zarif: "Yeni yaşı sevdiklerle karşılayalım.",
    sicak: "Yeni bir yaş, yeni bir sayfa!",
    neseli: "Mumları saymayın, sadece gelin!",
  },
  mevlid: {
    zarif: "Mevlid-i Şerif'e teşriflerinizi rica ederiz.",
    sicak: "Şerbetimiz, lokumumuz sizi bekliyor.",
    manevi: "Dualarınızla aramızda olmanızı dileriz.",
  },
  iftar: {
    zarif: "Sofralarımızı sizinle paylaşmak isteriz.",
    sicak: "Bir hurma, bir yudum su, bol muhabbet.",
    manevi: "Oruçlarınız kabul olsun, iftarımıza buyurun.",
  },
  asker: {
    zarif: "Yiğidimizi vatan hizmetine uğurluyoruz.",
    sicak: "Yolu açık, bahtı açık olsun!",
    neseli: "Tezkereye kadar yok; son halayı birlikte çekelim!",
    manevi: "Allah'a emanet, dualarla uğurlayalım.",
  },
  evpartisi: {
    zarif: "Yeni yuvamızda sizi ağırlamak isteriz.",
    sicak: "Çayımız demlendi, kapımız açık.",
    neseli: "Kolileri açtık (çoğunu!), sıra kutlamada!",
    manevi: "Evimiz hayırlı olsun; dualarınızla buyurun.",
  },
  yemek: {
    zarif: "Sofralarımızı sizinle paylaşmak isteriz.",
    sicak: "Sofra kuruldu, çay demde, muhabbet hazır.",
    neseli: "Diyetler bir akşamlığına iptal!",
  },
  mezuniyet: {
    zarif: "Yılların emeği bir diplomada buluştu.",
    sicak: "Okul bitti, hayat başlıyor!",
    neseli: "Kepler havaya uçacak, siz de orada olun!",
  },
  bulusma: {
    zarif: "Güzel bir buluşmada görüşmek isteriz.",
    sicak: "Özledik! Bir çay içimi muhabbet.",
    neseli: "Bahaneler kabul edilmiyor!",
  },
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
  // Türe özel sorular (web'deki lib/wizard.ts ile aynı kimlikler: sunucu cevapları
  // web'in listesine göre doğruluyor, metin de bu cevaplara göre yazılıyor)
  {
    id: "vesile",
    title: "Mevlid ne vesilesiyle okunacak?",
    when: tur("mevlid"),
    options: [
      { id: "bebek", label: "Bebeğimiz için" },
      { id: "ev", label: "Yeni evimiz için" },
      { id: "rahmetli", label: "Rahmetlimizin anısına" },
      {
        id: "sukur",
        label: "Şükür için",
        hint: "Hayırlı bir iş, sağlık, kavuşma",
      },
    ],
  },
  {
    id: "kinatarz",
    title: "Nasıl bir kına gecesi?",
    lead: "Bugün kınaların çoğu ikisini birleştiriyor: önce kına yakılıyor, sonra dans.",
    when: tur("kina"),
    options: [
      {
        id: "geleneksel",
        label: "Geleneksel",
        hint: "Bindallı, kına türküleri, gelin ağlatma",
      },
      {
        id: "hibrit",
        label: "Gelenek ve eğlence bir arada",
        hint: "Kına yakılır, sonra müzik ve dans",
      },
      {
        id: "modern",
        label: "Modern kına partisi",
        hint: "Koreografi, DJ, konfeti",
      },
    ],
  },
  {
    id: "sunyas",
    title: "Şehzademiz kaç yaşında?",
    lead: "Büyük çocuk davetine kendi ağzından seslenebilir; bebek için metni aile yazar.",
    when: tur("sunnet"),
    options: [
      { id: "bebek", label: "Bebek", hint: "0–2 yaş" },
      { id: "kucuk", label: "Küçük", hint: "3–6 yaş" },
      { id: "buyuk", label: "Büyük", hint: "7 yaş ve üstü" },
    ],
  },
  {
    id: "sunakis",
    title: "Sünnet düğününde neler olacak?",
    when: tur("sunnet"),
    options: [
      {
        id: "ikisi",
        label: "Mevlid de eğlence de",
        hint: "En yaygını: önce mevlid, sonra eğlence",
      },
      { id: "mevlid", label: "Mevlid ve yemek", hint: "Manevi ve sade" },
      {
        id: "eglence",
        label: "Müzik ve eğlence",
        hint: "Palyaço, sihirbaz, DJ",
      },
      { id: "sofra", label: "Aile sofrası", hint: "Küçük ve sade" },
    ],
  },
  {
    id: "bscins",
    title: "Bebeğin cinsiyeti belli mi?",
    when: tur("babyshower"),
    options: [
      { id: "kiz", label: "Kız" },
      { id: "erkek", label: "Erkek" },
      { id: "sir", label: "Henüz sır", hint: "Davetliler tahminini yazsın" },
    ],
  },
  {
    id: "bsduzen",
    title: "Kutlamayı kim düzenliyor?",
    lead: "Baby shower'ı çoğu zaman anne adayının kardeşi ya da yakın arkadaşları hazırlar.",
    when: tur("babyshower"),
    options: [
      { id: "aile", label: "Anne-baba adayı" },
      {
        id: "sevenler",
        label: "Arkadaşlar ve aile",
        hint: "Anne adayının haberi var",
      },
      {
        id: "surpriz",
        label: "Sürpriz parti",
        hint: "Davette “çaktırmayın” uyarısı çıkar",
      },
    ],
  },
  {
    id: "meslek",
    title: "Meslek seçtirme olacak mı?",
    lead: "Bebeğin önüne kalem, makas, stetoskop gibi eşyalar konur; hangisini seçerse…",
    when: tur("disbugdayi"),
    options: [
      { id: "evet", label: "Evet, olacak" },
      { id: "hayir", label: "Hayır, sadece buğday ve sofra" },
    ],
  },
  {
    id: "dgkim",
    title: "Kimin doğum günü?",
    when: tur("dogumgunu"),
    options: [
      { id: "cocuk", label: "Bir çocuğun" },
      { id: "genc", label: "Bir gencin", hint: "13–25 yaş" },
      { id: "yetiskin", label: "Bir yetişkinin" },
      {
        id: "buyuk",
        label: "Bir büyüğümüzün",
        hint: "Annemiz, babamız, dedemiz, ninemiz",
      },
    ],
  },
  {
    id: "surpriz",
    title: "Sürpriz parti mi?",
    when: tur("dogumgunu"),
    options: [
      { id: "hayir", label: "Hayır, haberi var" },
      {
        id: "evet",
        label: "Evet, sürpriz!",
        hint: "Davette “çaktırmayın” uyarısı çıkar",
      },
    ],
  },
  {
    id: "okul",
    title: "Hangi mezuniyet?",
    when: tur("mezuniyet"),
    options: [
      { id: "ilk", label: "İlkokul ya da ortaokul" },
      { id: "lise", label: "Lise" },
      { id: "uni", label: "Üniversite" },
      { id: "yuksek", label: "Yüksek lisans ya da doktora" },
    ],
  },
  {
    id: "mzkutla",
    title: "Nasıl kutluyoruz?",
    when: tur("mezuniyet"),
    options: [
      { id: "yemek", label: "Törenin ardından yemek" },
      { id: "parti", label: "Mezuniyet partisi" },
      { id: "aile", label: "Evde, aile sofrasında" },
    ],
  },
  {
    id: "askyon",
    title: "Uğurlama mı, karşılama mı?",
    when: tur("asker"),
    options: [
      { id: "ugurlama", label: "Askere uğurlama" },
      { id: "karsilama", label: "Askerden dönüş", hint: "Tezkere kutlaması" },
    ],
  },
  {
    id: "askakis",
    title: "Neler olacak?",
    lead: "Pek çok yörede askere gidene kına yakılır, davul zurna çalar.",
    when: tur("asker"),
    options: [
      {
        id: "kina",
        label: "Kına ve davul zurna",
        hint: "Geleneksel asker gecesi",
        when: (a) => a.askyon !== "karsilama",
      },
      {
        id: "davul",
        label: "Davul zurnayla karşılama",
        when: (a) => a.askyon === "karsilama",
      },
      {
        id: "yemek",
        label: "Yemek",
        hint: "Uğurlama ya da hoş geldin sofrası",
      },
      {
        id: "konvoy",
        label: "Konvoyla uğurlama",
        hint: "Otogara ya da havalimanına",
        when: (a) => a.askyon !== "karsilama",
      },
    ],
  },
  {
    id: "ikram",
    title: "Mevlidin ardından ne ikram edilecek?",
    when: tur("mevlid"),
    options: [
      { id: "yemek", label: "Yemek" },
      { id: "lokma", label: "Lokma, helva ve şerbet" },
      { id: "cay", label: "Çay ve kurabiye" },
    ],
  },
  {
    id: "iftaryer",
    title: "İftar nerede açılacak?",
    when: tur("iftar"),
    options: [
      { id: "ev", label: "Evimizde" },
      { id: "restoran", label: "Restoranda" },
      { id: "bahce", label: "Bahçede, açık havada" },
    ],
  },
  {
    id: "evtur",
    title: "Nasıl bir ev daveti?",
    when: tur("evpartisi"),
    options: [
      {
        id: "hayirli",
        label: "Ev hayırlısı",
        hint: "Büyüklerle, çay ve sohbet",
      },
      {
        id: "parti",
        label: "Ev partisi",
        hint: "Arkadaşlarla, müzik ve eğlence",
      },
      { id: "ikisi", label: "İkisi bir arada" },
    ],
  },
  {
    id: "yemekneden",
    title: "Bu sofranın vesilesi ne?",
    when: tur("yemek"),
    options: [
      { id: "ozlem", label: "Sebepsiz, özledik" },
      {
        id: "kutlama",
        label: "Bir kutlama",
        hint: "Terfi, yıl dönümü, güzel bir haber",
      },
      {
        id: "tanisma",
        label: "Tanışma yemeği",
        hint: "Aileler, yeni komşular",
      },
      { id: "bayram", label: "Bayram sofrası" },
    ],
  },
  {
    id: "kimler",
    title: "Kimler buluşuyor?",
    when: tur("bulusma"),
    options: [
      { id: "okul", label: "Okul arkadaşları" },
      { id: "is", label: "İş arkadaşları" },
      { id: "aile", label: "Aile ve akrabalar" },
      { id: "komsu", label: "Komşular" },
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
    titleOf: (a) => `${buyukHarf(davetAdi(a))} nasıl konuşsun?`,
    options: [
      {
        id: "zarif",
        label: "Zarif ve ölçülü",
        hintOf: (a) => tonOrnegi(a.tur, "zarif"),
      },
      {
        id: "sicak",
        label: "Sıcak ve içten",
        hintOf: (a) => tonOrnegi(a.tur, "sicak"),
      },
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
    when: (a) =>
      !isToren(a) &&
      !MANEVI.includes(a.tur ?? "") &&
      !HAVASIZ.includes(a.tur ?? ""),
    options: [
      { id: "cosku", label: "Coşkulu ve renkli" },
      { id: "sicakhava", label: "Küçük ve samimi" },
      { id: "sik", label: "Şık ve sakin" },
    ],
  },
  {
    id: "istek",
    title: "Davetlilerden bir isteğin var mı?",
    // Mevlid ve iftarda "yanında getir" ya da kıyafet notu yadırganır
    when: (a) => !MANEVI.includes(a.tur ?? ""),
    options: [
      { id: "yok", label: "Hayır, sadece gelsinler" },
      { id: "getir", label: "Yanlarında bir şey getirsinler" },
      { id: "kiyafet", label: "Kıyafet konusunda bir not var" },
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
  // Sihirbazın gerçek cevap kimliklerinden türe uygun özgün kapak seçilir.
  const selected: Record<string, CoverId> = {
    dugun: a.stil === "klasik" ? "olive" : "arch",
    kina: "henna",
    sunnet: "nazar",
    babyshower: "flower",
    disbugdayi: "wheat",
    mevlid: "rose",
    iftar: "moon",
    dogumgunu: a.dgkim === "cocuk" ? "ribbon" : "chess",
    mezuniyet: a.mzkutla === "parti" ? "neon" : "film",
    asker: a.askyon === "karsilama" ? "welcomeback" : "flag",
    evpartisi: a.evtur === "hayirli" ? "home" : "disco",
    yemek: a.hava === "sik" ? "cobalt" : "citrus",
    bulusma: "paper",
  };
  const coverId: CoverId = selected[a.tur || ""] || "sunset";
  return {
    coverId: coverId in covers ? coverId : "cherry",
    category:
      a.tur === "asker" && a.askyon === "karsilama"
        ? "Askerden dönüş"
        : (CATEGORY_OF[a.tur ?? ""] ?? "Buluşma"),
    request: a.istek && a.istek !== "yok" ? a.istek : "",
    photoId: "",
  };
}

/** Türe özel sorulara karşılık (web'deki lib/sozler.ts ile aynı). */
export const SORU_TEPKI: Record<string, Record<string, string>> = {
  kinatarz: {
    geleneksel: "Bindallılar, türküler… Geleneğe yakışır bir davet olacak.",
    hibrit: "Önce kına, sonra dans!",
    modern: "Pist hazır, konfetiler hazır!",
  },
  sunyas: {
    bebek: "Minik şehzade! Metni ailenin ağzından yazacağız.",
    kucuk: "Şehzademiz davetine kendi ağzından da seslenebilir!",
    buyuk: "Şehzademiz davetine kendi ağzından da seslenebilir!",
  },
  sunakis: {
    ikisi: "Önce mevlid, sonra eğlence. Davette ikisi de yazacak.",
    mevlid: "Mevlid-i Şerif davette yer alacak.",
    eglence: "Eğlence dolu bir gün, not aldık!",
    sofra: "Sade ve sıcak bir sofra.",
  },
  bscins: {
    kiz: "Bir kız bebek, ne güzel!",
    erkek: "Bir erkek bebek, ne güzel!",
    sir: "Sır kalsın; davetliler tahminini yazacak.",
  },
  bsduzen: {
    surpriz: "Şşşt! Davette “çaktırmayın” uyarısı çıkacak.",
    aile: "Not aldık.",
    sevenler: "Ne güzel bir jest!",
  },
  meslek: {
    evet: "Makas mı, kalem mi? Davette de soracağız!",
    hayir: "Buğday ve sofra, sade ve güzel.",
  },
  dgkim: {
    cocuk: "Çocuklara göre neşeli bir dil kuracağız.",
    genc: "Genç ve enerjik bir dil geliyor.",
    yetiskin: "Not aldık.",
    buyuk: "Büyüğümüze yakışır, saygılı bir dil kuracağız.",
  },
  surpriz: {
    evet: "Şşşt! Davette “çaktırmayın” uyarısı çıkacak.",
    hayir: "Not aldık.",
  },
  okul: {
    ilk: "Minik mezunumuza tebrikler!",
    lise: "Lise bitti, yeni yol başlıyor!",
    uni: "Kepler havaya!",
    yuksek: "Tebrikler, emeğe saygı!",
  },
  mzkutla: {
    yemek: "Törenden sonra sofrada buluşulacak.",
    parti: "Mezuniyet partisi, harika!",
    aile: "Aile sofrasında, sıcacık.",
  },
  askyon: {
    ugurlama: "Yolu açık olsun!",
    karsilama: "Hoş geldin askerimiz! Tezkere kutlaması hazırlanıyor.",
  },
  askakis: {
    kina: "Kınası yakılacak, davul zurna çalacak!",
    davul: "Davul zurnayla karşılanacak!",
    yemek: "Sofra kuruluyor.",
    konvoy: "Konvoy bilgisi davette yazacak.",
  },
  ikram: {
    yemek: "Mevlidin ardından yemek, not aldık.",
    lokma: "Lokma, helva ve şerbet… Geleneğe yakışır.",
    cay: "Çay ve kurabiye, not aldık.",
  },
  iftaryer: {
    ev: "Ev sofrası, en güzeli.",
    restoran: "Not aldık.",
    bahce: "Açık havada iftar, ne güzel!",
  },
  evtur: {
    hayirli: "Ev hayırlısı: büyüklere yakışır, sıcak bir davet.",
    parti: "Ev partisi, müzik hazır!",
    ikisi: "Hem hayırlı olsun hem eğlence!",
  },
  yemekneden: {
    ozlem: "Özlem gidermeye en güzel bahane!",
    kutlama: "Güzel haberler kutlanır!",
    tanisma: "Tanışmaya en güzel bahane: bir sofra.",
    bayram: "Bayram sofrası, el öpmeye hazır olun!",
  },
  kimler: {
    okul: "Eski dostlar bir araya geliyor!",
    is: "Mesai dışında buluşma, harika.",
    aile: "Hasret giderilecek.",
    komsu: "Komşuluk en güzel akrabalık.",
  },
};
