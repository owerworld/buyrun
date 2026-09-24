/**
 * Türe ve türe özel cevaplara göre örnekler: son sayfadaki alan adları ve
 * örnekleri, önizlemenin başlığı, davet sayfasındaki uyarı ve not kutusu.
 *
 * Kullanıcı "baby shower"da "düğün" örneği görmesin; hacı karşılamasında
 * "uğurluyoruz", sürpriz partide "ev sahibi" yazmasın.
 */

import { cocukDogumGunu, type Answers } from "./wizard";

export type Alanlar = [baslik: string, baslikOrnek: string, ev: string, evOrnek: string];

const TUR_ALAN: Record<string, Alanlar> = {
  sunnet: ["Davetin başlığı", "Mert'in sünnet düğünü", "Anne ve baba", "Ayşe & Ahmet Yılmaz"],
  babyshower: ["Davetin başlığı", "Minik Zeynep yolda", "Anne-baba adayı", "Zeynep & Can"],
  cinsiyet: ["Davetin başlığı", "Kız mı, erkek mi?", "Aile", "Zeynep & Can"],
  disbugdayi: ["Davetin başlığı", "Ela'nın diş buğdayı", "Aile", "Zeynep & Can Demir"],
  mevlid: ["Davetin başlığı", "Mevlid-i Şerif", "Davet eden", "Yılmaz ailesi"],
  iftar: ["Davetin başlığı", "İftar soframıza buyrun", "Davet eden", "Yılmaz ailesi"],
  hac: ["Davetin başlığı", "Hacı adayımızı uğurluyoruz", "Davet eden", "Yılmaz ailesi"],
  asker: ["Davetin başlığı", "Emre'yi askere uğurluyoruz", "Davet eden", "Kaya ailesi"],
  bekarlik: ["Davetin başlığı", "Elif'e bekârlığa veda", "Düzenleyen", "Nazlı ve Ece"],
  kina: ["Davetin başlığı", "Zeynep'in kına gecesi", "Davet eden", "Zeynep'in ailesi"],
  dogumgunu: ["Davetin başlığı", "İyi ki doğdun, Ece!", "Ev sahibi", "Ece"],
  mezuniyet: ["Davetin başlığı", "Mezun olduk!", "Davet eden", "Deniz ya da 2027 Mezunları"],
  evpartisi: ["Davetin başlığı", "Yeni evimize buyrun", "Ev sahibi", "Elif & Can"],
  yemek: ["Davetin başlığı", "Cuma akşamı sofrası", "Ev sahibi", "Elif & Can"],
  bulusma: ["Davetin başlığı", "Lise arkadaşları buluşuyor", "Düzenleyen", "Deniz"],
};
const VARSAYILAN: Alanlar = ["Etkinliğin adı", "Bir araya gelelim", "Ev sahibi", "Ece ya da Bilgisayar Kulübü"];

/** Son sayfadaki başlık ve ev sahibi alanlarının adı ve örneği. */
export function alanlarFor(a: Answers): Alanlar {
  const [b, bo, e, eo] = TUR_ALAN[a.tur ?? ""] ?? VARSAYILAN;
  switch (a.tur) {
    case "mevlid":
      return a.vesile === "rahmetli" ? [b, "Rahmetli Hasan Yılmaz'ın anısına", e, eo] : [b, bo, e, eo];
    case "hac": {
      const t: Record<string, string> = { umreugur: "Umre yolcumuzu uğurluyoruz", hackars: "Hacımız hoş geldi", umrekars: "Umreden hoş geldiniz" };
      return [b, t[a.hacyon ?? ""] ?? bo, e, eo];
    }
    case "asker":
      return a.askyon === "karsilama" ? [b, "Emre tezkeresini aldı!", e, eo] : [b, bo, e, eo];
    case "bekarlik":
      if (a.bkkim === "damat") return [b, "Mert'e bekârlığa veda", e, "Mert'in arkadaşları"];
      if (a.bkkim === "cift") return [b, "Elif & Mert'e bekârlığa veda", e, "Arkadaşları"];
      return [b, bo, e, eo];
    case "babyshower":
      return a.bsduzen === "aile" ? [b, bo, e, eo] : [b, bo, "Düzenleyen", "Zeynep'in arkadaşları"];
    case "dogumgunu": {
      const ev = a.surpriz === "evet" ? "Sürprizi hazırlayan" : e;
      if (cocukDogumGunu(a)) return [b, "Ela 5 yaşında!", ev, a.surpriz === "evet" ? "Annesi ve babası" : "Zeynep & Can"];
      if (a.dgkim === "buyuk") return [b, "Babaannemiz 80 yaşında!", ev, "Torunları"];
      if (a.dgkim === "genc") return [b, "Ece 18 oldu!", ev, a.surpriz === "evet" ? "Ece'nin arkadaşları" : eo];
      return [b, bo, ev, a.surpriz === "evet" ? "Ece'nin arkadaşları" : eo];
    }
    case "mezuniyet": {
      const t: Record<string, string> = { ilk: "Ela ilkokulu bitirdi!", lise: "Deniz liseden mezun!", uni: "Mezun olduk!", yuksek: "Deniz yüksek lisansını tamamladı" };
      return [b, t[a.okul ?? ""] ?? bo, e, a.okul === "ilk" ? "Ela'nın ailesi" : eo];
    }
    case "evpartisi":
      return [b, a.evtur === "hayirli" ? "Yeni evimiz hayırlı olsun" : a.evtur === "parti" ? "Yeni ev partisi" : bo, e, eo];
    case "yemek": {
      const t: Record<string, string> = { kutlama: "Terfi kutlaması", tanisma: "Tanışma yemeği", bayram: "Bayram sofrası" };
      return [b, t[a.yemekneden ?? ""] ?? bo, e, eo];
    }
    case "bulusma": {
      const t: Record<string, string> = { okul: "Lise arkadaşları buluşuyor", is: "Ekip yemeği", aile: "Aile buluşması", komsu: "Komşular buluşuyor" };
      return [b, t[a.kimler ?? ""] ?? bo, e, eo];
    }
    default:
      return [b, bo, e, eo];
  }
}

/** Önizlemede, kullanıcı daha başlık yazmadan görünen başlık. */
export function ornekBaslik(a: Answers) {
  if (!a.tur) return "Sizin davetiniz";
  return alanlarFor(a)[1];
}

/** "Ne getirsinler?" ve kıyafet notunun örnekleri; her günün kendi alışkanlığı var. */
const ISTEK_ORNEK: Record<string, [getir: string, kiyafet: string]> = {
  dogumgunu: ["Örn: Birlikte dinlemek istediğiniz bir şarkıyı yazın", "Örn: Temamız 90'lar, ona göre giyinin"],
  mezuniyet: ["Örn: Okul yıllarından bir fotoğraf getirin", "Örn: Kep ve cüppe bizden, siz rahat gelin"],
  evpartisi: ["Örn: Evimize bir saksı çiçek yeter", "Örn: Rahat gelin, yer minderlerimiz var"],
  yemek: ["Örn: Yanınızda bir tatlı getirin", "Örn: Bahçede oturacağız, hırka alın"],
  bulusma: ["Örn: Eski fotoğraflarınızı getirin", "Örn: Piknik var, rahat ayakkabı giyin"],
  bekarlik: ["Örn: Bir anı ya da tavsiye yazıp getirin", "Örn: Hepimiz pembe giyiyoruz"],
  kina: ["Örn: Tefinizi getirin, türküler söylenecek", "Örn: Kırmızı ya da bordo giyelim"],
  sunnet: ["Örn: Çocuklar için boya kalemi getirin, resim köşemiz var", "Örn: Mavi tonlarında giyinirsek fotoğraflar güzel olur"],
  babyshower: ["Örn: Bebeğe bir dilek kartı yazın", "Örn: Pastel renkler giyelim"],
  cinsiyet: ["Örn: Tahmininizi bir karta yazıp getirin", "Örn: Tahmininize göre pembe ya da mavi giyin"],
  disbugdayi: ["Örn: Bebeğe bir dilek yazın", "Örn: Rahat gelin, yer sofrası kuruyoruz"],
  asker: ["Örn: Askerimize bir not yazıp getirin", "Örn: Kırmızı beyaz giyelim"],
};
export function istekOrnekleri(a: Answers): [string, string] {
  if (a.tur === "bekarlik" && a.bkkim === "damat") return ["Örn: Damada bir tavsiye yazıp getirin", "Örn: Hepimiz beyaz gömlek giyiyoruz"];
  if (a.tur === "bekarlik" && a.bktarz === "tekne") return ["Örn: Güneş kremi ve mayonuzu unutmayın", "Örn: Beyaz giyiyoruz, deniz kıyafeti rahat olsun"];
  return ISTEK_ORNEK[a.tur ?? ""] ?? ["Örn: Yanınızda bir tatlı getirin", "Örn: Rahat kıyafetle gelin"];
}

/**
 * Davet sayfasında davetliye özel iki şey: sürprizse en üstte uyarı, bir de
 * "ev sahibine not" kutusunun örneği (cinsiyet partisinde tahmin gibi).
 */
export function davetEkleri(a: Answers, samimi = false, surprizSaati = "") {
  // Saat ekle birlikte yazılmaz ("20:30'da" ünlü uyumu ister); "saat 20:30 gibi" herkese doğru okunur
  const sen = samimi;
  const uyar = (bas: string, kim: string, kime: string) =>
    surprizSaati
      ? `${bas} ${kim} saat ${surprizSaati} gibi gelecek; ${sen ? "daha önce gel ve çaktırma!" : "lütfen daha önce gelin ve çaktırmayın."}`
      : `${bas} ${sen ? `Sakın ${kime} çaktırma!` : `Lütfen ${kime} çaktırmayın.`}`;
  let uyari = "";
  if (a.tur === "dogumgunu" && a.surpriz === "evet") uyari = uyar("Bu bir sürpriz parti!", "Doğum günü sahibi", "doğum günü sahibine");
  if (a.tur === "babyshower" && a.bsduzen === "surpriz") uyari = uyar("Bu bir sürpriz!", "Anne adayı", "anne adayına");

  // Saatin altındaki kısa hatırlatma: iftar ezanla açılır, tekne beklemez…
  let ipucu = "";
  if (a.tur === "iftar") ipucu = "İftar akşam ezanıyla açılacak; lütfen birkaç dakika önce gelin.";
  if (a.tur === "bekarlik" && a.bktarz === "tekne") ipucu = "Tekne saatinde kalkar; lütfen 15 dakika önce iskelede olun.";
  if (a.tur === "asker" && a.askakis === "konvoy") ipucu = "Konvoya katılacaklar araçlarıyla biraz erken gelsin.";
  if (a.tur === "cinsiyet") ipucu = "Büyük anı kaçırmamak için geç kalmayın!";
  if (a.tur === "hac" && (a.hacyon === "hackars" || a.hacyon === "umrekars")) ipucu = "Zemzem ve hurma ikram edilecek.";

  const notlar: Record<string, string> = {
    cinsiyet: "Tahmininizi yazın: kız mı, erkek mi?",
    babyshower: a.bscins === "sir" ? "Tahmininizi yazın: kız mı, erkek mi?" : "Bebeğe ya da anne adayına bir dilek yazın",
    disbugdayi: a.meslek === "evet" ? "Tahmininizi yazın: bebek hangi eşyayı seçecek?" : "Bebeğe bir dilek yazın",
    bekarlik: "Bir anı ya da tavsiye yazın",
    dogumgunu: "Doğum günü sahibine bir dilek yazın",
    mezuniyet: "Mezunumuza bir tebrik yazın",
    asker: a.askyon === "karsilama" ? "Askerimize bir hoş geldin yazın" : "Askerimize bir dilek yazın",
    hac: "Dua ve dileklerinizi yazın",
    sunnet: "Şehzademize bir dilek yazın",
    evpartisi: "Yeni eve bir dilek yazın",
    kina: "Geline bir dilek yazın",
  };
  let not = notlar[a.tur ?? ""] ?? "";
  if (samimi) not = not.replace("Tahmininizi", "Tahminini").replace("yazın", "yaz");
  // Davet sayfasında ev sahibinin etiketi: sürpriz partide "Düzenleyen", sünnette "Anne ve baba"
  const ev = a.tur ? alanlarFor(a)[2] : "";
  if (samimi) ipucu = ipucu.replace("lütfen birkaç dakika önce gelin", "birkaç dakika önce gel").replace("lütfen 15 dakika önce iskelede olun", "15 dakika önce iskelede ol").replace("geç kalmayın", "geç kalma");
  return { uyari, not, ev, ipucu, akisBaslik: sonAdim(a).akisBaslik };
}

/* ------------------------------------------------------------------ */
/* Son adım: her etkinliğin kendi alanları                             */
/* ------------------------------------------------------------------ */

export interface SonAdim {
  /** "Ne zaman, nerede?" bölümünün başlığı */
  zamanBaslik: string;
  saat: string;
  /** Saatin altında kısa not (iftarda akşam ezanı gibi) */
  saatNot?: string;
  yer: string;
  yerOrnek: string;
  /** Günün akışı: her satıra bir madde, türün alışkanlığıyla örnek */
  akisBaslik: string;
  akisOrnek: string;
  /** Kontenjan sorulsun mu, sorulursa etiketi */
  kontenjan: string | null;
  /** Mevlidi okuyacak hoca (mevlid ve mevlidli sünnet) */
  mevlidhan: boolean;
  /** Sürpriz partide sürprizin sahibinin geleceği saat */
  surpriz: string | null;
}

const AKIS: Record<string, string> = {
  "sunnet-ikisi": "13:00 Mevlid-i Şerif\n14:00 Yemek\n15:00 Eğlence ve oyunlar\n17:00 Pasta",
  "sunnet-mevlid": "13:00 Mevlid-i Şerif\n14:00 Yemek ikramı",
  "sunnet-eglence": "15:00 Karşılama\n16:00 Sihirbaz gösterisi\n17:00 Pasta ve dans",
  "sunnet-sofra": "13:00 Aile sofrası\n15:00 Tatlı ve çay",
  "kina-geleneksel": "20:00 Karşılama\n21:00 Gelin çıkışı (bindallı)\n21:30 Kına yakma ve türküler",
  "kina-hibrit": "20:00 Karşılama\n21:00 Kına yakma\n22:00 DJ ve dans",
  "kina-modern": "20:00 Karşılama\n20:30 Koreografi\n21:00 Kına\n21:30 Dans",
  "bekarlik-tekne": "13:00 İskeleden kalkış (geç kalan kalır!)\n15:00 Yüzme molası\n19:00 Dönüş",
  "bekarlik-gece": "20:00 Yemek\n22:00 Dans",
  "bekarlik-ev": "20:00 Buluşma\n21:00 Oyunlar ve sürprizler",
  "bekarlik-gunduz": "11:00 Brunch\n13:00 Fotoğraf çekimi",
  babyshower: "14:00 Karşılama\n14:30 Oyunlar\n15:30 Pasta ve dilekler",
  cinsiyet: "15:00 Karşılama ve tahminler\n16:00 Büyük an: açıklama\n16:15 Pasta",
  "disbugdayi-evet": "15:00 Karşılama\n15:30 Meslek seçme\n16:00 Buğday ve tatlı ikramı",
  "disbugdayi-hayir": "15:00 Karşılama\n15:30 Buğday ve tatlı ikramı",
  "dogumgunu-cocuk": "15:00 Oyunlar\n16:00 Pasta\n16:30 Palyaço gösterisi",
  dogumgunu: "20:00 Yemek\n21:30 Pasta\n22:00 Dans",
  "mezuniyet-yemek": "10:00 Mezuniyet töreni\n13:00 Kutlama yemeği",
  "mezuniyet-parti": "21:00 Parti\n22:00 Kep atma",
  "mezuniyet-aile": "19:00 Aile sofrası\n20:30 Pasta",
  "asker-kina": "20:00 Asker gecesi, davul zurna\n21:00 Kına yakma",
  "asker-yemek": "19:00 Uğurlama yemeği\n21:00 Dua ve helalleşme",
  "asker-konvoy": "08:00 Evden konvoyla hareket\n09:00 Otogarda uğurlama",
  "asker-davul": "Otogarda davul zurnayla karşılama\nArdından evde hoş geldin sofrası",
  "asker-donus": "19:00 Hoş geldin sofrası\n20:30 Davul zurna",
  mevlid: "14:00 Kur'an-ı Kerim tilaveti\n14:15 Mevlid-i Şerif\n15:00 Dua ve ikram",
  iftar: "Akşam ezanıyla iftar\nİftardan sonra çay ve sohbet",
  "hac-ugurlama": "Dua ve helalleşme\nİkram",
  "hac-karsilama": "Zemzem ve hurma ikramı\nHacımızın hatıraları ve duası",
  "evpartisi-hayirli": "Çay ve ikram\nEv gezmesi",
  evpartisi: "20:00 Ev turu\n21:00 Müzik ve eğlence",
  yemek: "20:00 Aperatifler\n20:30 Akşam yemeği\n22:00 Tatlı ve kahve",
  bulusma: "14:00 Buluşma\n15:00 Çay ve sohbet\n17:00 Toplu fotoğraf",
};

function akisAnahtari(a: Answers) {
  switch (a.tur) {
    case "sunnet": return `sunnet-${a.sunakis ?? "ikisi"}`;
    case "kina": return `kina-${a.kinatarz ?? "hibrit"}`;
    case "bekarlik": return `bekarlik-${a.bktarz ?? "gece"}`;
    case "disbugdayi": return `disbugdayi-${a.meslek ?? "evet"}`;
    case "dogumgunu": return cocukDogumGunu(a) ? "dogumgunu-cocuk" : "dogumgunu";
    case "mezuniyet": return `mezuniyet-${a.mzkutla ?? "yemek"}`;
    case "asker":
      if (a.askyon === "karsilama") return a.askakis === "davul" ? "asker-davul" : "asker-donus";
      return `asker-${a.askakis ?? "yemek"}`;
    case "hac": return a.hacyon === "hackars" || a.hacyon === "umrekars" ? "hac-karsilama" : "hac-ugurlama";
    case "evpartisi": return a.evtur === "hayirli" ? "evpartisi-hayirli" : "evpartisi";
    default: return a.tur ?? "";
  }
}

/** Son adımda bu davet için sorulacak alanlar ve örnekleri. */
export function sonAdim(a: Answers): SonAdim {
  const tur = a.tur ?? "";
  const s: SonAdim = {
    zamanBaslik: "Ne zaman, nerede?", saat: "Saat", yer: "Yer", yerOrnek: "Örn: Moda Teras",
    akisBaslik: "Günün akışı", akisOrnek: AKIS[akisAnahtari(a)] ?? "",
    kontenjan: "Kontenjan", mevlidhan: false, surpriz: null,
  };
  switch (tur) {
    case "sunnet":
      Object.assign(s, { saat: "Başlama saati", yer: "Düğün yeri", yerOrnek: "Örn: Nilüfer Kır Düğün Salonu", kontenjan: null, mevlidhan: a.sunakis === "ikisi" || a.sunakis === "mevlid" });
      break;
    case "kina":
      Object.assign(s, { akisBaslik: "Gecenin akışı", yer: "Kına nerede yakılacak?", yerOrnek: "Örn: Kız evi ya da Bahçe Davet", kontenjan: null });
      break;
    case "bekarlik":
      if (a.bktarz === "tekne") Object.assign(s, { saat: "Kalkış saati", yer: "Buluşma iskelesi", yerOrnek: "Örn: Kuruçeşme İskelesi", kontenjan: "Teknenin kapasitesi" });
      else Object.assign(s, { akisBaslik: "Gecenin akışı", yerOrnek: a.bktarz === "ev" ? "Örn: Nazlı'nın evi" : "Örn: Moda Teras" });
      break;
    case "babyshower":
      Object.assign(s, { akisBaslik: "Kutlamanın akışı", yerOrnek: "Örn: Moda Teras ya da evimiz" });
      if (a.bsduzen === "surpriz") s.surpriz = "Anne adayı kaçta gelecek?";
      break;
    case "cinsiyet":
      Object.assign(s, { akisBaslik: "Partinin akışı", saat: "Parti saati" });
      break;
    case "disbugdayi":
      Object.assign(s, { yerOrnek: "Örn: Evimiz" });
      break;
    case "dogumgunu":
      Object.assign(s, { akisBaslik: "Partinin akışı", yerOrnek: cocukDogumGunu(a) ? "Örn: Oyun Evi Kafe" : "Örn: Moda Teras" });
      if (a.surpriz === "evet") s.surpriz = "Doğum günü sahibi kaçta gelecek?";
      break;
    case "mezuniyet":
      Object.assign(s, { yerOrnek: a.mzkutla === "aile" ? "Örn: Evimiz" : a.mzkutla === "parti" ? "Örn: Kordon Teras" : "Örn: Okul bahçesi ya da restoran" });
      break;
    case "asker":
      Object.assign(s, a.askyon === "karsilama"
        ? { saat: "Karşılama saati", yer: "Karşılama yeri", yerOrnek: "Örn: Otogar ya da evimiz", kontenjan: null }
        : { saat: "Uğurlama saati", yer: "Buluşma yeri", yerOrnek: a.askakis === "konvoy" ? "Örn: Evimizin önü" : "Örn: Köy meydanı ya da evimiz", kontenjan: null });
      break;
    case "mevlid":
      Object.assign(s, { akisBaslik: "Mevlid programı", saat: "Mevlid saati", yer: "Mevlid nerede okunacak?", yerOrnek: "Örn: Evimiz ya da Yeşil Camii", kontenjan: null, mevlidhan: true });
      break;
    case "iftar":
      Object.assign(s, {
        akisBaslik: "Akşamın akışı", saat: "İftar saati (akşam ezanı)",
        saatNot: "Diyanet'in imsakiyesinden bakabilirsiniz; davette misafirlere biraz erken gelmeleri hatırlatılır.",
        yer: "İftar nerede?", yerOrnek: a.iftaryer === "restoran" ? "Örn: Kordon Lokantası" : a.iftaryer === "bahce" ? "Örn: Evimizin bahçesi" : "Örn: Evimiz",
        kontenjan: null,
      });
      break;
    case "hac": {
      const karsilama = a.hacyon === "hackars" || a.hacyon === "umrekars";
      Object.assign(s, { saat: karsilama ? "Ziyaret saati" : "Toplanma saati", yer: karsilama ? "Hacımızı nerede ziyaret edelim?" : "Yer", yerOrnek: "Örn: Evimiz", kontenjan: null });
      break;
    }
    case "evpartisi":
      Object.assign(s, { yer: "Yeni evimiz", yerOrnek: "Örn: Yeni evimizin adresi" });
      break;
    case "yemek":
      Object.assign(s, { akisBaslik: "Akşamın akışı", yerOrnek: a.yemekneden === "bayram" ? "Örn: Babaannemizin evi" : "Örn: Evimiz ya da Kordon Restoran" });
      break;
    case "bulusma":
      Object.assign(s, { yerOrnek: a.kimler === "okul" ? "Örn: Eski okulumuzun karşısındaki çay bahçesi" : "Örn: Moda sahili" });
      break;
  }
  return s;
}

/** Törenlerin program örnekleri: düğün, nişan ve söz farklı akar. */
export function torenAkisOrnegi(tur: string, nikahAyri: boolean) {
  if (tur === "nisan") return "Her satıra bir madde:\n19:00 Karşılama\n20:00 Yüzük takma\n20:30 Pasta ve tatlı ikramı\n21:00 Eğlence";
  if (tur === "soz") return "Her satıra bir madde:\n19:00 Karşılama\n19:30 Kahve ve tatlı ikramı\n20:00 Söz yüzüğü";
  return "Her satıra bir madde:\n15:00 Gelin alma\n19:00 " + (nikahAyri ? "Karşılama" : "Nikâh töreni") + "\n20:00 Yemek\n21:00 İlk dans\n21:30 Takı merasimi\n22:30 Pasta kesimi";
}
