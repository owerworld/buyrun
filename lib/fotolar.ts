/**
 * Etkinlik davetlerinin kapak fotoğrafları.
 *
 * Hepsi CC0 (kamu malı) lisanslı: telifsiz, filigransız, ticari kullanım serbest,
 * atıf zorunlu değil. Yine de fotoğrafçının emeğini davet sayfasında küçük bir
 * satırla anıyoruz.
 *
 * Neden canlı arama değil de seçilmiş liste? Ücretsiz görsel servislerinde
 * "sünnet" ya da "iftar" arayınca Hint düğünü, Çin feneri, elçilik yemeği gibi
 * kültüre uymayan sonuçlar geliyor; kişisel yüzler de çıkabiliyor. Her türe elle
 * seçilmiş, yüz içermeyen fotoğraflar kendi sunucumuzdan verilir. Davetlinin
 * tarayıcısı başka bir siteye istek atmaz, fotoğraf kaynağı kaybolsa da davet bozulmaz.
 *
 * Kaynaklar: WordPress Photo Directory (wordpress.org/photos, tümü CC0 ve denetimli)
 * ve rawpixel kamu malı koleksiyonu; Openverse (Creative Commons) üzerinden bulundu.
 */

export interface Foto {
  id: string;
  /** Sihirbazdaki davet türü (lib/wizard.ts) */
  tur: string;
  /** Ekran okuyucu için kısa açıklama */
  alt: string;
  /** Fotoğrafçı; bilinmiyorsa kaynağın adı */
  credit: string;
  /** Fotoğrafın kaynak sayfası */
  link: string;
}

const RP = "rawpixel";
const WP = (ad: string) => `${ad} · WordPress Photos`;

export const FOTOLAR: Foto[] = [
  { id: "sunnet-1", tur: "sunnet", alt: "Dala asılı mavi nazar boncukları", credit: RP, link: "https://www.rawpixel.com/image/5922865" },
  { id: "sunnet-2", tur: "sunnet", alt: "Nazar boncuğu ağacı", credit: RP, link: "https://www.rawpixel.com/image/6034726" },
  { id: "sunnet-3", tur: "sunnet", alt: "Tek büyük nazar boncuğu", credit: RP, link: "https://www.rawpixel.com/image/6034727" },
  { id: "sunnet-4", tur: "sunnet", alt: "Nazar boncuklarıyla süslü ağaç", credit: RP, link: "https://www.rawpixel.com/image/6034424" },

  { id: "kina-1", tur: "kina", alt: "Kına tepsisini andıran mumlu kâse", credit: WP("Topher"), link: "https://wordpress.org/photos/photo/2516387d11/" },
  { id: "kina-2", tur: "kina", alt: "Sıcak ışıkta iki mum", credit: WP("Roy Tanck"), link: "https://wordpress.org/photos/photo/718636f685/" },
  { id: "kina-3", tur: "kina", alt: "Kırmızı işlemeli örtü", credit: RP, link: "https://www.rawpixel.com/image/7473947" },

  { id: "bekarlik-1", tur: "bekarlik", alt: "Pembe konfeti", credit: WP("Nilo Velez"), link: "https://wordpress.org/photos/photo/51167dd285/" },
  { id: "bekarlik-2", tur: "bekarlik", alt: "Gökyüzünde uçuşan konfeti", credit: RP, link: "https://www.rawpixel.com/image/5921670" },
  { id: "bekarlik-3", tur: "bekarlik", alt: "Disko topu", credit: WP("Mohammed Kateregga"), link: "https://wordpress.org/photos/photo/77069e5f4a/" },
  { id: "bekarlik-4", tur: "bekarlik", alt: "Deniz manzarasında iki kadeh", credit: RP, link: "https://www.rawpixel.com/image/3284980" },

  { id: "babyshower-1", tur: "babyshower", alt: "İnciler arasında bebek ayakkabıları", credit: RP, link: "https://www.rawpixel.com/image/6028878" },
  { id: "babyshower-2", tur: "babyshower", alt: "Beyaz bebek ayakkabıları", credit: RP, link: "https://www.rawpixel.com/image/5904166" },
  { id: "babyshower-3", tur: "babyshower", alt: "Pembe örgü patikler", credit: RP, link: "https://www.rawpixel.com/image/5913298" },

  { id: "cinsiyet-1", tur: "cinsiyet", alt: "Gökyüzüne bırakılan renkli balonlar", credit: RP, link: "https://www.rawpixel.com/image/6028795" },
  { id: "cinsiyet-2", tur: "cinsiyet", alt: "Pastel renkli küçük balonlar", credit: WP("Mohammad Shoeb Ansari"), link: "https://wordpress.org/photos/photo/19267d3c90/" },
  { id: "cinsiyet-3", tur: "cinsiyet", alt: "Kremalı kekler", credit: RP, link: "https://www.rawpixel.com/image/3303684" },

  { id: "disbugdayi-1", tur: "disbugdayi", alt: "Buğday taneleri", credit: WP("Bigul Malayi"), link: "https://wordpress.org/photos/photo/599694ac6d/" },
  { id: "disbugdayi-2", tur: "disbugdayi", alt: "Altın rengi buğday başağı", credit: RP, link: "https://www.rawpixel.com/image/6033038" },
  { id: "disbugdayi-3", tur: "disbugdayi", alt: "Bereketin simgesi nar", credit: RP, link: "https://www.rawpixel.com/image/5917570" },

  { id: "dogumgunu-1", tur: "dogumgunu", alt: "Mumları yanan çikolatalı pasta", credit: WP("Nilo Velez"), link: "https://wordpress.org/photos/photo/56677d16e9/" },
  { id: "dogumgunu-2", tur: "dogumgunu", alt: "Çilekli beyaz pasta ve mum", credit: WP("Bigul Malayi"), link: "https://wordpress.org/photos/photo/5756955552/" },
  { id: "dogumgunu-3", tur: "dogumgunu", alt: "Mumlu çikolatalı kek", credit: "Markus Spiske · rawpixel", link: "https://www.rawpixel.com/image/432524" },

  { id: "mevlid-1", tur: "mevlid", alt: "Kırmızı güller", credit: RP, link: "https://www.rawpixel.com/image/6032792" },
  { id: "mevlid-2", tur: "mevlid", alt: "Pembe ve beyaz güller", credit: RP, link: "https://www.rawpixel.com/image/3283381" },
  { id: "mevlid-3", tur: "mevlid", alt: "Cami avizesi", credit: WP("bdthemes"), link: "https://wordpress.org/photos/photo/56365efefe/" },

  { id: "iftar-1", tur: "iftar", alt: "Kâsede hurma", credit: RP, link: "https://www.rawpixel.com/image/6039074" },
  { id: "iftar-2", tur: "iftar", alt: "Mum ışığında fener", credit: RP, link: "https://www.rawpixel.com/image/6032483" },
  { id: "iftar-3", tur: "iftar", alt: "Tepside hurmalar", credit: RP, link: "https://www.rawpixel.com/image/5956086" },

  { id: "hac-1", tur: "hac", alt: "Gece Kâbe", credit: RP, link: "https://www.rawpixel.com/image/5922887" },
  { id: "hac-2", tur: "hac", alt: "Kâbe ve Mescid-i Haram", credit: RP, link: "https://www.rawpixel.com/image/5919676" },
  { id: "hac-3", tur: "hac", alt: "Tarihî seccade", credit: RP, link: "https://www.rawpixel.com/image/10155253" },

  { id: "evpartisi-1", tur: "evpartisi", alt: "Avuçta yeni evin anahtarları", credit: RP, link: "https://www.rawpixel.com/image/5969541" },
  { id: "evpartisi-2", tur: "evpartisi", alt: "Aydınlık oturma odası", credit: RP, link: "https://www.rawpixel.com/image/5926843" },
  { id: "evpartisi-3", tur: "evpartisi", alt: "Saksıda üç çiçek", credit: WP("Alina Kakshapati"), link: "https://wordpress.org/photos/photo/84368db7ce/" },

  { id: "yemek-1", tur: "yemek", alt: "Şiş ve mezeler", credit: RP, link: "https://www.rawpixel.com/image/6031681" },
  { id: "yemek-2", tur: "yemek", alt: "Kurulmuş uzun davet sofrası", credit: RP, link: "https://www.rawpixel.com/image/6030367" },
  { id: "yemek-3", tur: "yemek", alt: "Çiçekli akşam sofrası", credit: RP, link: "https://www.rawpixel.com/image/5969194" },

  { id: "mezuniyet-1", tur: "mezuniyet", alt: "Mezuniyet kepleri", credit: RP, link: "https://www.rawpixel.com/image/5921966" },
  { id: "mezuniyet-2", tur: "mezuniyet", alt: "Sayfaları açılan kitap", credit: RP, link: "https://www.rawpixel.com/image/5919478" },
  { id: "mezuniyet-3", tur: "mezuniyet", alt: "Rafta eski kitaplar", credit: RP, link: "https://www.rawpixel.com/image/5927201" },

  { id: "asker-1", tur: "asker", alt: "Boğaz'da dalgalanan Türk bayrağı", credit: RP, link: "https://www.rawpixel.com/image/6037868" },
  { id: "asker-2", tur: "asker", alt: "Mavi gökyüzünde Türk bayrağı", credit: RP, link: "https://www.rawpixel.com/image/6016967" },
  { id: "asker-3", tur: "asker", alt: "Ay yıldız", credit: RP, link: "https://www.rawpixel.com/image/6024883" },

  // Buluşmanın ilk fotoğrafı çay: Türkiye'de buluşmanın simgesi
  { id: "bulusma-3", tur: "bulusma", alt: "Gün batımında bir bardak çay", credit: WP("Saifullah Nakih"), link: "https://wordpress.org/photos/photo/4226a36cdb/" },
  { id: "bulusma-1", tur: "bulusma", alt: "Ahşap masada kahve", credit: RP, link: "https://www.rawpixel.com/image/5927231" },
  { id: "bulusma-2", tur: "bulusma", alt: "Piknik sepeti", credit: RP, link: "https://www.rawpixel.com/image/3301281" },
];

const BY_ID = new Map(FOTOLAR.map((f) => [f.id, f]));

export const isFoto = (id: unknown): id is string => typeof id === "string" && BY_ID.has(id);
export const fotoOf = (id: string | null | undefined) => (id ? BY_ID.get(id) ?? null : null);
/** Fotoğrafın adresi; aynı sunucudan, uzun süre önbelleğe alınabilir. */
export const fotoSrc = (id: string) => `/foto/${id}.jpg`;

/** Bir davet türünün fotoğrafları. Tür bilinmiyorsa buluşma fotoğrafları (kahve, çay, piknik). */
export function fotolarFor(tur: string | undefined) {
  const list = FOTOLAR.filter((f) => f.tur === tur);
  return list.length ? list : FOTOLAR.filter((f) => f.tur === "bulusma");
}

/** Uygulamadan gelen etkinliklerin kategorisi (lib/wizard.ts CATEGORY_OF) → fotoğraf türü. */
const KATEGORI_TUR: Record<string, string> = {
  "Kına gecesi": "kina", "Bekârlığa veda": "bekarlik", "Doğum günü": "dogumgunu", "Mezuniyet": "mezuniyet",
  "Ev partisi": "evpartisi", "Akşam yemeği": "yemek", "Buluşma": "bulusma", "Sünnet": "sunnet",
  "Baby shower": "babyshower", "Cinsiyet partisi": "cinsiyet", "Diş buğdayı": "disbugdayi",
  "Mevlid": "mevlid", "İftar": "iftar", "Hac uğurlaması": "hac", "Asker uğurlaması": "asker",
};
export const turOfCategory = (category: string) => KATEGORI_TUR[category] ?? "";
