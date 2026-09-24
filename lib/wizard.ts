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

import { fotolarFor } from "./fotolar";
import { patternOf } from "./design";
import { isTheme, themeOf } from "./themes";
import { acilisSecenekleri, tonOrnegi } from "./sozler";

export type Answers = Record<string, string>;

export interface Option {
  id: string;
  label: string;
  /** Seçeneğin altında küçük açıklama */
  hint?: string;
  /** Seçenek yalnızca koşul sağlanırsa gösterilir (ör. mevlid için "neşeli" dil yok) */
  when?: (a: Answers) => boolean;
  /** Açıklama türe göre değişiyorsa: ör. ton örnekleri mezuniyette başka, sünnette başka */
  hintOf?: (a: Answers) => string | undefined;
}

/**
 * Sorunun nasıl gösterileceği. Metin listesi yerine görsel seçim kartları:
 * renk örnekleri, süsleme örneği, yazı karakteri örneği ya da kapak görseli.
 */
export type Look = "liste" | "kutular" | "renk" | "susleme" | "yazi" | "kapak" | "desen";

export interface Question {
  id: string;
  /** Soru başlığı */
  title: string;
  /** Başlık türe göre değişiyorsa: "Baby shower davetiniz nasıl konuşsun?" */
  titleOf?: (a: Answers) => string;
  /** Başlığın altındaki kısa cümle */
  lead?: string;
  options: Option[];
  /** Görünüm; boşsa liste */
  look?: Look;
  /** Seçeneklerin sırası türe göre değişiyorsa (renk, doku): listede olmayanlar sona */
  order?: (a: Answers) => string[];
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
  sunnet: "cocuk", babyshower: "cocuk", cinsiyet: "cocuk", disbugdayi: "cocuk",
  // Doğum günü iki grupta da var; grup bilinmiyorsa "kimin?" sorusu sorulsun
  dogumgunu: "dostlar",
  mevlid: "manevi", iftar: "manevi", hac: "manevi",
  evpartisi: "dostlar", yemek: "dostlar", mezuniyet: "dostlar", asker: "dostlar", bulusma: "dostlar",
};

/**
 * Davetin adı: düğün, kına, sünnet gibi basılı geleneği olanlar "davetiye",
 * baby shower, iftar, doğum günü gibi günler "davet". Sihirbaz her yerde bu adla konuşur.
 */
export function davetAdi(a: Answers) {
  switch (a.tur) {
    case "dugun": return "düğün davetiyeniz";
    case "nisan": return "nişan davetiyeniz";
    case "soz": return "söz davetiyeniz";
    case "kina": return "kına davetiyeniz";
    case "sunnet": return "sünnet davetiyeniz";
    case "bekarlik": return "veda partisi davetiniz";
    case "babyshower": return "baby shower davetiniz";
    case "cinsiyet": return "cinsiyet partisi davetiniz";
    case "disbugdayi": return "diş buğdayı davetiniz";
    case "dogumgunu": return a.surpriz === "evet" ? "sürpriz parti davetiniz" : "doğum günü davetiniz";
    case "mevlid": return "mevlid davetiniz";
    case "iftar": return "iftar davetiniz";
    case "hac": return a.hacyon === "hackars" || a.hacyon === "umrekars" ? "hoş geldin davetiniz" : "uğurlama davetiniz";
    case "asker": return a.askyon === "karsilama" ? "hoş geldin davetiniz" : "uğurlama davetiniz";
    case "evpartisi": return a.evtur === "hayirli" ? "ev hayırlısı davetiniz" : "ev partisi davetiniz";
    case "yemek": return "yemek davetiniz";
    case "mezuniyet": return "mezuniyet davetiniz";
    case "bulusma": return "buluşma davetiniz";
    default: return "davetiniz";
  }
}
export const buyukHarf = (s: string) => s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
/** Sorunun bu cevaplarla görünen başlığı. */
export const soruBasligi = (q: Question, a: Answers) => q.titleOf?.(a) ?? q.title;

/** Çocuğun doğum günü mü? Açık cevap ("kimin doğum günü?") gruptan önce gelir. */
export const cocukDogumGunu = (a: Answers) => (a.dgkim ? a.dgkim === "cocuk" : a.grup === "cocuk");

/** Soru yalnızca bu türlerde sorulur. */
const tur = (...t: string[]) => (a: Answers) => t.includes(a.tur ?? "");

/**
 * Havayı kendi sorusuyla belli olan türler: "Nasıl bir hava olsun?" ayrıca sorulmaz,
 * süsleme ve kapak türe özel cevaptan çıkar (havaOf).
 */
const HAVASIZ = ["sunnet", "kina", "asker", "bekarlik", "evpartisi", "mezuniyet"];

/** Tür listesini seçilen gruba göre süzer. Grup sorulmadıysa (ana sayfadan türle gelindiyse) hepsi geçerli. */
function grupta(...gruplar: string[]) {
  return (a: Answers) => !a.grup || gruplar.includes(a.grup);
}

/**
 * Her davetin kendi renkleri: sıradaki ilk renk o gün için önerilen ("siz seçin"
 * denirse o gelir). Asker uğurlamasında al bayrak, baby shower'da bebek pembesi ya da
 * mavisi, iftarda gece mavisi ve hurma, buluşmada demli çay… Uymayan renk sunulmaz.
 */
export function renkListesi(a: Answers): string[] {
  switch (a.tur) {
    case "dugun": case "nisan": case "soz":
      return ["lal", "klasik", "gul", "zumrut", "gece", "krem", "inci", "turkuaz", "pastel", "mor", "siyahaltin"];
    case "kina": return ["lal", "mor", "klasik", "gul", "zumrut", "fusya"];
    case "bekarlik":
      return a.bkkim === "damat"
        ? ["gece", "siyahaltin", "haki", "klasik", "zumrut", "inci"]
        : ["gul", "fusya", "inci", "siyahaltin", "mor", "gece"];
    case "sunnet": return ["turkuaz", "bebekmavi", "gece", "zumrut", "klasik", "lal"];
    case "babyshower":
      if (a.bscins === "kiz") return ["bebekpembe", "gul", "pastel", "inci", "bugday", "bebekmavi"];
      if (a.bscins === "erkek") return ["bebekmavi", "turkuaz", "pastel", "inci", "bugday", "bebekpembe"];
      return ["pastel", "tahmin", "bugday", "inci", "bebekpembe", "bebekmavi"];
    case "cinsiyet": return ["tahmin", "bebekpembe", "bebekmavi", "pastel", "inci"];
    case "disbugdayi": return ["bugday", "pastel", "bebekpembe", "bebekmavi", "krem"];
    case "dogumgunu":
      if (cocukDogumGunu(a)) return ["bebekmavi", "bebekpembe", "fusya", "turkuaz", "bugday", "tahmin"];
      if (a.dgkim === "buyuk") return ["klasik", "zumrut", "krem", "gul", "inci", "hurma"];
      return ["fusya", "gul", "siyahaltin", "gece", "mor", "inci", "lal"];
    case "mezuniyet":
      return a.okul === "ilk"
        ? ["bebekmavi", "turkuaz", "bugday", "fusya", "gece"]
        : ["gece", "siyahaltin", "klasik", "inci", "zumrut", "mor"];
    case "asker": return ["bayrak", "lal", "haki", "gece", "zumrut"];
    case "mevlid": return ["zumrut", "gul", "inci", "krem", "gece", "turkuaz"];
    case "iftar": return ["gece", "zumrut", "hurma", "turkuaz", "mor", "krem"];
    case "hac": return ["zumrut", "krem", "inci", "hurma", "gece"];
    case "evpartisi":
      return a.evtur === "hayirli"
        ? ["krem", "zumrut", "terrakota", "inci", "hurma"]
        : ["terrakota", "krem", "pastel", "fusya", "zumrut", "inci"];
    case "yemek":
      return a.yemekneden === "bayram"
        ? ["klasik", "zumrut", "krem", "terrakota", "hurma"]
        : ["gece", "terrakota", "klasik", "krem", "siyahaltin", "cay", "zumrut"];
    case "bulusma": return ["cay", "krem", "terrakota", "turkuaz", "pastel", "gece"];
    default: return ["klasik", "lal", "gul", "zumrut", "gece", "krem", "inci", "turkuaz", "pastel"];
  }
}

/**
 * Her davetin kendi dokuları, en uygunu önde: sünnette şehzade tacı ve nazar, diş
 * buğdayında başak, mezuniyette kep, askerde ay yıldız, mevlidde gül, buluşmada ince
 * belli çay bardağı. Uymayan doku hiç gösterilmez (mevlide konfeti sunulmaz).
 */
export function desenListesi(a: Answers): string[] {
  switch (a.tur) {
    case "dugun": case "nisan": case "soz":
      return ["cicekli", "mermer", "varak", "dantel", "gul", "cini", "yildiz", "nar", "ebru", "kalp"];
    case "kina": return ["bindalli", "varak", "gul", "dantel", "cicekli", "nar", "cini", "kalp"];
    case "bekarlik": return ["konfeti", "kalp", "varak", "mermer", "puantiye", "cicekli"];
    case "sunnet": return ["tac", "nazar", "cini", "yildiz", "balon", "varak"];
    case "babyshower": return ["bulut", "puantiye", "balon", "dantel", "cicekli", "nazar"];
    case "cinsiyet": return ["balon", "konfeti", "puantiye", "bulut", "kalp"];
    case "disbugdayi": return ["basak", "nar", "bulut", "puantiye", "dantel", "nazar"];
    case "dogumgunu":
      if (cocukDogumGunu(a)) return ["balon", "konfeti", "puantiye", "bulut", "tac"];
      if (a.dgkim === "buyuk") return ["cicekli", "gul", "varak", "kilim", "nar"];
      return ["konfeti", "balon", "puantiye", "varak", "kalp", "mermer"];
    case "mezuniyet": return ["kep", "konfeti", "yildiz", "varak", "mermer"];
    case "asker": return ["ayyildiz", "nazar", "kilim", "yildiz"];
    case "mevlid": return ["gul", "cini", "yildiz", "ebru"];
    case "iftar": return ["fener", "yildiz", "cini", "kilim"];
    case "hac": return ["gul", "cini", "yildiz", "ebru"];
    case "evpartisi":
      return a.evtur === "hayirli" ? ["kilim", "nar", "cicekli", "cay", "cini"] : ["konfeti", "kilim", "cicekli", "cay", "puantiye", "mermer"];
    case "yemek": return ["kilim", "nar", "cay", "mermer", "cicekli"];
    case "bulusma": return ["cay", "kilim", "konfeti", "puantiye", "ebru"];
    default: return ["varak", "cicekli", "mermer", "ebru", "yildiz"];
  }
}

/** Seçenek bu davetin listesinde mi? "Siz seçin" ve "sade" her zaman var. */
const renkte = (id: string) => (a: Answers) => renkListesi(a).includes(id);
const desende = (id: string) => (a: Answers) => desenListesi(a).includes(id);
const BEBEK_TUR = ["babyshower", "cinsiyet", "disbugdayi"];

/**
 * Bir sorunun bu cevaplarla gösterilecek seçenekleri: türe bağlı açıklamalar
 * doldurulmuş, sıralı sorularda en uygunu önde.
 */
export function visibleOptions(q: Question, a: Answers) {
  const list = q.options.filter((o) => !o.when || o.when(a)).map((o) => (o.hintOf ? { ...o, hint: o.hintOf(a) ?? o.hint } : o));
  const sira = q.order?.(a);
  if (!sira) return list;
  const yer = (id: string) => (sira.includes(id) ? sira.indexOf(id) : sira.length);
  return [...list].sort((x, y) => yer(x.id) - yer(y.id));
}

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
  /* ---------------------------------------------------------------- */
  /* Türe özel sorular: her günün kendi ayrıntısı var. Cevaplar davet   */
  /* metnine, davet sayfasına ve son sayfadaki örneklere işlenir.       */
  /* ---------------------------------------------------------------- */
  {
    id: "torenyer",
    title: "Tören nerede yapılacak?",
    lead: "Nişan ve söz çoğu zaman kız evinde, sıcak bir aile ortamında yapılır.",
    when: tur("nisan", "soz"),
    options: [
      { id: "kizevi", label: "Kız evinde", hint: "Geleneksel, aile arasında" },
      { id: "salon", label: "Salonda" },
      { id: "restoran", label: "Restoranda ya da otelde" },
      { id: "bahce", label: "Bahçede, açık havada" },
    ],
  },
  {
    id: "kinatarz",
    title: "Nasıl bir kına gecesi?",
    lead: "Bugün kınaların çoğu ikisini birleştiriyor: önce kına yakılıyor, sonra dans.",
    when: tur("kina"),
    options: [
      { id: "geleneksel", label: "Geleneksel", hint: "Bindallı, kına türküleri, gelin ağlatma" },
      { id: "hibrit", label: "Gelenek ve eğlence bir arada", hint: "Kına yakılır, sonra müzik ve dans" },
      { id: "modern", label: "Modern kına partisi", hint: "Koreografi, DJ, konfeti" },
    ],
  },
  {
    id: "bkkim",
    title: "Veda kimin için?",
    when: tur("bekarlik"),
    options: [
      { id: "gelin", label: "Gelin için" },
      { id: "damat", label: "Damat için" },
      { id: "cift", label: "Çift birlikte" },
    ],
  },
  {
    id: "bktarz",
    title: "Nasıl bir veda olacak?",
    when: tur("bekarlik"),
    options: [
      { id: "ev", label: "Evde, en yakınlarla" },
      { id: "gece", label: "Yemek ve gece eğlencesi" },
      { id: "tekne", label: "Tekne turu" },
      { id: "gunduz", label: "Brunch ya da gündüz buluşması" },
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
      { id: "ikisi", label: "Mevlid de eğlence de", hint: "En yaygını: önce mevlid, sonra eğlence" },
      { id: "mevlid", label: "Mevlid ve yemek", hint: "Manevi ve sade" },
      { id: "eglence", label: "Müzik ve eğlence", hint: "Palyaço, sihirbaz, DJ" },
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
      { id: "sevenler", label: "Arkadaşlar ve aile", hint: "Anne adayının haberi var" },
      { id: "surpriz", label: "Sürpriz parti", hint: "Davette “çaktırmayın” uyarısı çıkar" },
    ],
  },
  {
    id: "acikla",
    title: "Cinsiyet nasıl açıklanacak?",
    when: tur("cinsiyet"),
    options: [
      { id: "balon", label: "Balon patlatarak", hint: "En sevilen yöntem" },
      { id: "pasta", label: "Pasta keserek" },
      { id: "duman", label: "Renkli duman ya da konfeti" },
      { id: "kutu", label: "Kutudan uçan balonlar" },
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
    when: (a) => a.tur === "dogumgunu" && a.grup !== "cocuk",
    options: [
      { id: "cocuk", label: "Bir çocuğun" },
      { id: "genc", label: "Bir gencin", hint: "13–25 yaş" },
      { id: "yetiskin", label: "Bir yetişkinin" },
      { id: "buyuk", label: "Bir büyüğümüzün", hint: "Annemiz, babamız, dedemiz, ninemiz" },
    ],
  },
  {
    id: "surpriz",
    title: "Sürpriz parti mi?",
    when: tur("dogumgunu"),
    options: [
      { id: "hayir", label: "Hayır, haberi var" },
      { id: "evet", label: "Evet, sürpriz!", hint: "Davette “çaktırmayın” uyarısı çıkar" },
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
      { id: "kina", label: "Kına ve davul zurna", hint: "Geleneksel asker gecesi", when: (a) => a.askyon !== "karsilama" },
      { id: "davul", label: "Davul zurnayla karşılama", when: (a) => a.askyon === "karsilama" },
      { id: "yemek", label: "Yemek", hint: "Uğurlama ya da hoş geldin sofrası" },
      { id: "konvoy", label: "Konvoyla uğurlama", hint: "Otogara ya da havalimanına", when: (a) => a.askyon !== "karsilama" },
    ],
  },
  {
    id: "hacyon",
    title: "Ne için bir araya geliyoruz?",
    lead: "Hacdan dönene zemzem ve hurmayla “hoş geldin” demek de köklü bir gelenek.",
    when: tur("hac"),
    options: [
      { id: "hacugur", label: "Hac uğurlaması" },
      { id: "umreugur", label: "Umre uğurlaması" },
      { id: "hackars", label: "Hacı karşılaması", hint: "Zemzem ve hurmayla hoş geldin" },
      { id: "umrekars", label: "Umreden dönüş" },
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
      { id: "hayirli", label: "Ev hayırlısı", hint: "Büyüklerle, çay ve sohbet" },
      { id: "parti", label: "Ev partisi", hint: "Arkadaşlarla, müzik ve eğlence" },
      { id: "ikisi", label: "İkisi bir arada" },
    ],
  },
  {
    id: "yemekneden",
    title: "Bu sofranın vesilesi ne?",
    when: tur("yemek"),
    options: [
      { id: "ozlem", label: "Sebepsiz, özledik" },
      { id: "kutlama", label: "Bir kutlama", hint: "Terfi, yıl dönümü, güzel bir haber" },
      { id: "tanisma", label: "Tanışma yemeği", hint: "Aileler, yeni komşular" },
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
      { id: "buyukler", label: "Büyükler ve akrabalar", hint: "Saygılı, resmî bir dil" },
      { id: "karisik", label: "Karışık", hint: "Herkese uyan bir dil" },
      { id: "arkadaslar", label: "Arkadaşlar", hint: "Samimi, rahat bir dil" },
    ],
  },
  {
    id: "ton",
    title: "Davetiniz nasıl konuşsun?",
    titleOf: (a) => `${buyukHarf(davetAdi(a))} nasıl konuşsun?`,
    options: [
      // Örnek cümle davetin türüne göre değişir (lib/sozler.ts)
      { id: "zarif", label: "Zarif ve ölçülü", hintOf: (a) => tonOrnegi(a.tur, "zarif") },
      { id: "sicak", label: "Sıcak ve içten", hintOf: (a) => tonOrnegi(a.tur, "sicak") },
      { id: "neseli", label: "Neşeli ve esprili", hintOf: (a) => tonOrnegi(a.tur, "neseli"), when: (a) => !MANEVI.includes(a.tur ?? "") },
      { id: "manevi", label: "Manevi ve dualı", hintOf: (a) => tonOrnegi(a.tur, "manevi"), when: (a) => DUALI.includes(a.tur ?? "") },
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
    lead: "Bu güne yakışan renkler; en uygunu başta. İçinizden geleni seçin.",
    look: "renk",
    order: renkListesi,
    options: [
      { id: "lal", label: "Kına kırmızısı", hint: "Al & altın", when: renkte("lal") },
      { id: "klasik", label: "Bordo", hint: "Bordo & altın", when: renkte("klasik") },
      { id: "gul", label: "Pudra gül", hint: "Gül kurusu & bakır", when: renkte("gul") },
      { id: "zumrut", label: "Zümrüt", hint: "Zümrüt & altın", when: renkte("zumrut") },
      { id: "gece", label: "Gece mavisi", hint: "Lacivert & altın", when: renkte("gece") },
      { id: "krem", label: "Toprak", hint: "Kum & zeytin", when: renkte("krem") },
      { id: "inci", label: "İnci", hint: "Fildişi & siyah", when: renkte("inci") },
      { id: "turkuaz", label: "İznik", hint: "Kobalt, turkuaz & mercan", when: renkte("turkuaz") },
      { id: "pastel", label: "Pastel", hint: "Latte, vizon & adaçayı", when: renkte("pastel") },
      { id: "mor", label: "Kına moru", hint: "Mor & altın", when: renkte("mor") },
      { id: "fusya", label: "Şeker pembe", hint: "Fuşya & şeftali", when: renkte("fusya") },
      { id: "bebekpembe", label: "Bebek pembesi", hint: "Pudra pembe & krem", when: renkte("bebekpembe") },
      { id: "bebekmavi", label: "Bebek mavisi", hint: "Gök mavisi & gümüş", when: renkte("bebekmavi") },
      { id: "tahmin", label: "Pembe & mavi", hint: "Kız mı, erkek mi?", when: renkte("tahmin") },
      { id: "bugday", label: "Buğday", hint: "Buğday sarısı & krem", when: renkte("bugday") },
      { id: "siyahaltin", label: "Siyah & altın", hint: "Gece gibi şık", when: renkte("siyahaltin") },
      { id: "bayrak", label: "Al bayrak", hint: "Al & beyaz", when: renkte("bayrak") },
      { id: "haki", label: "Haki", hint: "Haki & kum", when: renkte("haki") },
      { id: "hurma", label: "Hurma", hint: "Hurma kahvesi & altın", when: renkte("hurma") },
      { id: "terrakota", label: "Kiremit", hint: "Terrakota & krem", when: renkte("terrakota") },
      { id: "cay", label: "Demli çay", hint: "Çay kızılı & altın", when: renkte("cay") },
      { id: "sizsecin", label: "Siz seçin", hint: "Diğer cevaplarıma göre", hintOf: (a) => (isToren(a) ? undefined : `Önerimiz: ${themeOf(renkListesi(a)[0]).label}`) },
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
    lead: "Çerçevenin süslemesi buna göre değişecek.",
    look: "susleme",
    when: (a) => !isToren(a) && !MANEVI.includes(a.tur ?? "") && !HAVASIZ.includes(a.tur ?? ""),
    options: [
      { id: "cosku", label: "Coşkulu ve renkli", hint: "Art deco" },
      { id: "sicakhava", label: "Küçük ve samimi", hint: "Çiçek dalları" },
      { id: "sik", label: "Şık ve sakin", hint: "İnce çizgi" },
    ],
  },
  {
    id: "desen",
    title: "Arka planda hangi doku olsun?",
    lead: "Bu güne yakışan dokular; her birinin bir anlamı var.",
    look: "desen",
    order: desenListesi,
    options: [
      { id: "cicekli", label: "Çiçekli", hint: "Romantik, en çok sevilen", when: desende("cicekli") },
      { id: "mermer", label: "Mermer", hint: "Modern ve şık", when: desende("mermer") },
      { id: "varak", label: "Altın varak", hint: "Görkemli, ışıltılı", when: desende("varak") },
      {
        id: "dantel", label: "Dantel ve oya", hint: "Gelinliğin, çeyizin inceliği", when: desende("dantel"),
        hintOf: (a) => (BEBEK_TUR.includes(a.tur ?? "") ? "Bebek battaniyesinin, oyanın inceliği" : undefined),
      },
      { id: "bindalli", label: "Bindallı sırması", hint: "Kınanın altın işlemesi", when: desende("bindalli") },
      { id: "nazar", label: "Nazar", hint: "Maşallah, nazardan korusun", when: desende("nazar") },
      { id: "fener", label: "Hilal ve fener", hint: "Ramazan'ın ışığı", when: desende("fener") },
      { id: "cini", label: "Çini", hint: "Lale ve karanfil", when: desende("cini") },
      { id: "yildiz", label: "Selçuklu yıldızı", hint: "Mutluluk ve sonsuzluk", when: desende("yildiz") },
      { id: "nar", label: "Nar", hint: "Bereket ve bolluk", when: desende("nar") },
      { id: "ebru", label: "Ebru", hint: "UNESCO mirası Türk sanatı", when: desende("ebru") },
      { id: "tac", label: "Şehzade tacı", hint: "Şehzademizin büyük günü", when: desende("tac") },
      { id: "bulut", label: "Bulut ve yıldız", hint: "Bebek odası gibi", when: desende("bulut") },
      { id: "basak", label: "Buğday başağı", hint: "Dişler buğday gibi sağlam olsun", when: desende("basak") },
      { id: "kep", label: "Mezuniyet kepi", hint: "Emeğin taçlandığı gün", when: desende("kep") },
      { id: "ayyildiz", label: "Ay yıldız", hint: "Vatan sana emanet", when: desende("ayyildiz") },
      { id: "gul", label: "Gül", hint: "Gül kokulu meclis", when: desende("gul"), hintOf: (a) => (isToren(a) || a.tur === "kina" ? "Aşkın ve zarafetin çiçeği" : undefined) },
      { id: "kilim", label: "Kilim", hint: "Anadolu'nun sıcaklığı", when: desende("kilim") },
      { id: "cay", label: "İnce belli çay", hint: "Çayı demledik, buyurun", when: desende("cay") },
      { id: "balon", label: "Balonlar", hint: "Kutlamanın neşesi", when: desende("balon") },
      { id: "konfeti", label: "Konfeti", hint: "Parti havası", when: desende("konfeti") },
      { id: "puantiye", label: "Puantiye", hint: "Tatlı ve oyuncu", when: desende("puantiye") },
      { id: "kalp", label: "Kalpler", hint: "Sevgiyle", when: desende("kalp") },
      { id: "sade", label: "Sade", hint: "Dokusuz, yalnızca renk" },
      { id: "sizsecin", label: "Siz seçin", hint: "Diğer cevaplarıma göre", hintOf: (a) => (isToren(a) ? undefined : `Önerimiz: ${patternOf(desenListesi(a)[0]).label}`) },
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
    // Kız evindeki nişan ve sözde servis ve program sorulmaz
    when: (a) => isToren(a) && a.torenyer !== "kizevi",
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
    // Mevlid, iftar ve hacda "yanınızda getirin" ya da kıyafet notu yadırganır
    when: (a) => !isToren(a) && !MANEVI.includes(a.tur ?? ""),
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
  /** Arka plan dokusu (lib/design.ts) */
  pattern: string;
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
  /** Etkinlik dalı: türe uygun kapak fotoğrafı (lib/fotolar.ts); tören dalında boş */
  photo: string;
}

const CATEGORY_OF: Record<string, string> = {
  dugun: "Düğün", nisan: "Düğün", soz: "Düğün",
  kina: "Kına gecesi", bekarlik: "Bekârlığa veda", dogumgunu: "Doğum günü", mezuniyet: "Mezuniyet",
  evpartisi: "Ev partisi", yemek: "Akşam yemeği", bulusma: "Buluşma",
  sunnet: "Sünnet", babyshower: "Baby shower", cinsiyet: "Cinsiyet partisi", disbugdayi: "Diş buğdayı",
  mevlid: "Mevlid", iftar: "İftar", hac: "Hac uğurlaması", asker: "Asker uğurlaması",
};

/** Alt türü olan günlerde kategori de değişir: hacı karşılaması, askerden dönüş. */
function categoryFor(a: Answers) {
  if (a.tur === "hac") {
    const alt: Record<string, string> = { umreugur: "Umre uğurlaması", hackars: "Hacı karşılaması", umrekars: "Umreden dönüş" };
    if (alt[a.hacyon ?? ""]) return alt[a.hacyon ?? ""];
  }
  if (a.tur === "asker" && a.askyon === "karsilama") return "Askerden dönüş";
  return CATEGORY_OF[a.tur ?? ""] ?? "Buluşma";
}

const BEBEK = ["babyshower", "cinsiyet", "disbugdayi"];

/**
 * Tören dalında üç eksen ayrı ayrı seçilir. Açık cevap her zaman kazanır;
 * "siz seçin" dendiğinde eksik eksen diğer cevaplardan türetilir.
 */
function themeFor(a: Answers) {
  if (a.renk && a.renk !== "sizsecin" && isTheme(a.renk)) return a.renk;
  if (!isToren(a)) return renkListesi(a)[0];
  const fromStil: Record<string, string> = { klasik: "klasik", romantik: "gul", sade: "inci", modern: "gece", bohem: "krem", cini: "turkuaz" };
  if (fromStil[a.stil ?? ""]) return fromStil[a.stil];
  if (a.ton === "zarif") return "krem";
  if (a.ton === "neseli") return "lal";
  if (a.ton === "manevi") return "zumrut";
  return "klasik";
}

/**
 * Havası kendi sorusundan belli olan türlerde "hava" karşılığı: sünnette eğlence
 * coşkulu, tekne vedası coşkulu, ev hayırlısı samimi…
 */
const HAVA_KARSILIGI: Record<string, Record<string, string>> = {
  sunakis: { mevlid: "sik", eglence: "cosku", ikisi: "cosku", sofra: "sicakhava" },
  kinatarz: { modern: "cosku" },
  askakis: { kina: "cosku", davul: "cosku", konvoy: "cosku", yemek: "sicakhava" },
  bktarz: { tekne: "cosku", gece: "cosku", ev: "sicakhava", gunduz: "sik" },
  evtur: { hayirli: "sicakhava", parti: "cosku", ikisi: "sicakhava" },
  mzkutla: { parti: "cosku", yemek: "sik", aile: "sicakhava" },
};
export function havaOf(a: Answers) {
  if (a.hava) return a.hava;
  for (const [soru, karsilik] of Object.entries(HAVA_KARSILIGI)) if (karsilik[a[soru] ?? ""]) return karsilik[a[soru]];
  return "";
}

function ornamentFor(a: Answers, theme: string) {
  if (!isToren(a)) {
    // Manevi günlerde hava sorulmaz: çini lale. Diğerlerinde istenen hava süslemeyi seçer.
    if (MANEVI.includes(a.tur ?? "")) return "cini";
    const fromHava: Record<string, string> = { cosku: "deco", sicakhava: "cicek", sik: "cizgi" };
    if (fromHava[havaOf(a)]) return fromHava[havaOf(a)];
    if (a.tur === "sunnet" || a.tur === "kina") return "sirma";
    if (BEBEK.includes(a.tur ?? "")) return "cicek";
  }
  const fromStil: Record<string, string> = { klasik: "sirma", romantik: "cicek", sade: "cizgi", modern: "deco", bohem: "yaprak", cini: "cini" };
  if (fromStil[a.stil ?? ""]) return fromStil[a.stil];
  const fromTheme: Record<string, string> = {
    lal: "sirma", klasik: "sirma", gul: "cicek", zumrut: "deco", gece: "deco", krem: "yaprak", inci: "cizgi", turkuaz: "cini",
    mor: "sirma", fusya: "deco", bebekpembe: "cicek", bebekmavi: "cicek", tahmin: "cicek", bugday: "yaprak",
    siyahaltin: "deco", bayrak: "cizgi", haki: "cizgi", hurma: "cini", terrakota: "yaprak", cay: "cini",
  };
  return fromTheme[theme] ?? "sirma";
}

/** "Siz seçin" denirse türün ve seçilen ruhun doğal dokusu. */
function patternFor(a: Answers) {
  const secim = a.desen ?? "";
  if (secim && secim !== "sizsecin") return secim;
  // Etkinlikte türün ilk dokusu; törende seçilen ruh (aşağıda)
  if (!isToren(a)) return desenListesi(a)[0];
  const stil: Record<string, string> = { klasik: "varak", romantik: "cicekli", sade: "sade", modern: "mermer", bohem: "nar", cini: "cini" };
  return stil[a.stil ?? ""] ?? "sade";
}

function fontFor(a: Answers, ornament: string) {
  if (["kaligrafi", "klasik", "gorkemli", "siir", "modern"].includes(a.yazi ?? "")) return a.yazi;
  const fromOrnament: Record<string, string> = { sirma: "gorkemli", cicek: "kaligrafi", cizgi: "klasik", deco: "modern", yaprak: "siir", cini: "gorkemli" };
  if (a.ton === "manevi") return "gorkemli";
  if (!isToren(a)) {
    if (["mezuniyet", "bulusma", "yemek"].includes(a.tur ?? "") && a.ton !== "neseli") return "modern";
    const fromTon: Record<string, string> = { neseli: "kaligrafi", zarif: "klasik", sicak: "siir" };
    if (fromTon[a.ton ?? ""]) return fromTon[a.ton ?? ""];
  }
  if (a.ton === "neseli" && ornament !== "deco") return "kaligrafi";
  return fromOrnament[ornament] ?? "klasik";
}

/** Etkinlik dalında kapak: istenen hava her zaman kazanır; henüz sorulmadıysa türün doğal karşılığı. */
function coverFor(a: Answers) {
  const hava = havaOf(a);
  if (hava === "cosku") return "cherry";
  if (hava === "sik") return "midnight";
  if (hava === "sicakhava") return "bloom";
  if (a.tur === "iftar") return "midnight";
  if (MANEVI.includes(a.tur ?? "")) return "bloom";
  if (["dogumgunu", "evpartisi", "bekarlik", "sunnet", "asker"].includes(a.tur ?? "")) return "cherry";
  if (a.tur === "yemek" || a.tur === "bulusma") return "midnight";
  return "bloom";
}

/** Kapağın en üstündeki kısa satır; dilin tonunu ilk bakışta verir. Seçenekler lib/sozler.ts'de. */
export function openingFor(a: Answers) {
  return acilisSecenekleri(a)[0];
}

export function planFromAnswers(a: Answers): Plan {
  const toren = isToren(a);
  const theme = themeFor(a);
  const ornament = ornamentFor(a, theme);
  return {
    toren,
    mainKind: toren ? a.tur : "",
    extraKind: ["kina", "nikah", "after"].includes(a.ikinci ?? "") ? a.ikinci : "",
    theme, ornament, pattern: patternFor(a),
    font: fontFor(a, ornament),
    coverId: coverFor(a),
    category: categoryFor(a),
    wantsBus: toren && (a.ekler === "ikisi" || a.ekler === "servis"),
    wantsProgram: toren && (a.ekler === "ikisi" || a.ekler === "program"),
    request: !toren && a.istek && a.istek !== "yok" ? a.istek : "",
    families: toren && a.aile === "evet",
    opening: openingFor(a),
    photo: toren || !a.tur ? "" : fotolarFor(a.tur)[0].id,
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
