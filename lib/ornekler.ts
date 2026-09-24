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
export function davetEkleri(a: Answers, samimi = false) {
  let uyari = "";
  if (a.tur === "dogumgunu" && a.surpriz === "evet") uyari = "Bu bir sürpriz parti! Lütfen doğum günü sahibine çaktırmayın.";
  if (a.tur === "babyshower" && a.bsduzen === "surpriz") uyari = "Bu bir sürpriz! Lütfen anne adayına çaktırmayın.";

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
  return { uyari, not, ev };
}
