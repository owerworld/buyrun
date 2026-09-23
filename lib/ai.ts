/**
 * Davet metnini yazan katman.
 *
 * Sihirbazdaki cevaplar buraya gelir, davetlinin okuyacağı kısa metin çıkar.
 *
 * İki kural:
 *  1) AI isteğe bağlıdır. ANTHROPIC_API_KEY yoksa, model hata verirse ya da geç
 *     kalırsa kural tabanlı metin devreye girer. Davet oluşturma asla AI'a takılmaz.
 *  2) Çıkan metin süzülür: telefon, IBAN, para ve bağlantı içeren cümleler atılır.
 *     Ürünün hukuki ilkesi bu; modelin iyi niyeti yeterli değil.
 */

import { answerSummary, type Answers, type Plan } from "./wizard";

/** Opus 5 varsayılan. Maliyeti düşürmek isteyen ortam değişkeniyle değiştirir. */
const MODEL = process.env.BUYRUN_AI_MODEL || "claude-opus-5";
const TIMEOUT_MS = 20_000;

export interface TextInput {
  plan: Plan;
  answers: Answers;
  /** Tören: "Defne ile Mert" · Etkinlik: etkinliğin adı */
  heading: string;
  /** Etkinlik dalında ev sahibi */
  host?: string;
  /** Uzun tarih: "19 Haziran 2027 Cumartesi" */
  dateLabel: string;
  venue: string;
  city?: string;
  /** Tören dalında "kına gecemizde ve düğünümüzde" */
  greeting?: string;
  /** Davetlilerden istek: "Yanınızda tatlı getirin" gibi, kullanıcının kendi cümlesi */
  request?: string;
  /** Tören dalında iki ailenin adı: "Ayşe & Ahmet Yılmaz ve Fatma & Mehmet Kaya" */
  families?: string;
}

/** Davet metninde bulunmaması gerekenler: para, iletişim bilgisi, bağlantı. */
const YASAK = [
  /iban/i,
  /\bTR\s?\d{2}[\s\d]{10,}/i,
  /(\+90|0)?[\s(]?5\d{2}[\s)]?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/,
  /https?:\/\//i,
  /\bwww\./i,
  /@[a-z0-9.-]+\.[a-z]{2,}/i,
  /(hesap numaras|para gönder|takı yerine|bağış|ücret|ödeme)/i,
];

/** Modelin metnini cümle cümle süzer; şüpheli cümleyi atar, kalanı döndürür. */
export function sanitize(text: string) {
  const temiz = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .filter((c) => c && !YASAK.some((r) => r.test(c)))
    .join(" ")
    .trim();
  return temiz.slice(0, 600);
}

/* ------------------------------------------------------------------ */
/* Kural tabanlı yedek — AI olmadan da davet güzel görünür            */
/* ------------------------------------------------------------------ */

// Tarih ve yer davetiyede ayrıca gösteriliyor; metin onları tekrar etmez.
// Cümleler Türkiye'deki davetiye alışkanlıklarından derlendi: geleneksel, sıcak, neşeli ve manevi dil.
type Tonlu = Partial<Record<"zarif" | "sicak" | "neseli" | "manevi", string>> & { varsayilan: string };

const TOREN_METNI: Tonlu = {
  zarif: "Hayatımızın en güzel gününde sizi de yanımızda görmek bizim için ayrı bir mutluluk olacak. Bu anlamlı günü sizinle paylaşmaktan onur duyarız.",
  sicak: "Bu güzel günü sevdiklerimizle paylaşmak istiyoruz. Sizi de aramızda görmek bizi çok mutlu eder.",
  neseli: "Uzun zamandır beklediğimiz gün geldi! Bol müzik, bol kahkaha ve sizin de orada olmanızı istiyoruz.",
  manevi: "Allah'ın izniyle yuvamızı kuruyoruz. Bu mutlu günümüzde hayır dualarınızla aramızda olmanızı dileriz.",
  varsayilan: "Bu güzel günü sevdiklerimizle paylaşmak istiyoruz. Sizi de aramızda görmek bizi çok mutlu eder.",
};

const ETKINLIK_METNI: Record<string, Tonlu> = {
  sunnet: {
    manevi: "Allah'ın izniyle oğlumuzu sünnet ettiriyoruz. Bu mutlu günümüzde dualarınızla aramızda olmanızı dileriz.",
    neseli: "Büyüdüm artık maşallah, çocukluğuma eyvallah! Sünnet düğünümde sizi de bekliyorum.",
    varsayilan: "Oğlumuzun sünnet düğününe davetlisiniz; bu özel gün sizinle daha güzel olacak.",
  },
  mevlid: { varsayilan: "Okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz. Dualarınızla aramızda olmanızı dileriz." },
  iftar: { varsayilan: "Bu mübarek ayda sofralarımızı sevdiklerimizle paylaşmak istiyoruz. İftarımıza buyurun." },
  hac: { varsayilan: "Kutsal yolculuğa çıkmadan önce sizlerle helalleşmek ve dualarınızı almak isteriz." },
  asker: {
    manevi: "Evladımızı vatani görevine uğurluyoruz. Dualarınızla yanımızda olmanızı isteriz.",
    varsayilan: "Vatani görevine gidecek evladımızı hep birlikte uğurlamak istiyoruz. Sizi de aramızda görmek isteriz.",
  },
  babyshower: { varsayilan: "Minik misafirimizi beklerken bu heyecanı sizinle paylaşmak istiyoruz." },
  cinsiyet: { neseli: "Kız mı, erkek mi? Cevabı hep birlikte öğrenelim!", varsayilan: "Bebeğimizin cinsiyetini sevdiklerimizle birlikte öğrenmek istiyoruz." },
  disbugdayi: {
    manevi: "Bebeğimizin ilk dişi çıktı, maşallah! Diş buğdayımızda dualarınızla aramızda olmanızı isteriz.",
    varsayilan: "Bebeğimizin ilk dişi çıktı! Diş buğdayı kutlamamızda sizi de aramızda görmek isteriz.",
  },
  kina: {
    manevi: "Allah'ın izniyle gelinimizin kınası yakılacak. Bu güzel gecede aramızda olmanızı isteriz.",
    varsayilan: "Gelinimizin kınasını birlikte yakmak için sizi de aramızda görmek isteriz.",
  },
  bekarlik: { varsayilan: "Bekârlığa son bir kez birlikte veda edelim! Sizi de aramızda görmek isteriz." },
  evpartisi: {
    manevi: "Yeni evimiz hayırlı olsun diye sevdiklerimizi ağırlamak istiyoruz. Dualarınızla buyurun.",
    varsayilan: "Yeni evimizde sizi ağırlamak istiyoruz. Gelirseniz çok seviniriz.",
  },
};

const GENEL_ETKINLIK: Tonlu = {
  zarif: "Sizi aramızda görmek isteriz. Gelmeniz bizim için değerli.",
  sicak: "Birlikte olalım istedik. Gelirseniz çok seviniriz.",
  neseli: "Güzel bir gün olacak, sizi de bekliyoruz!",
  manevi: "Sizleri dualarınızla aramızda görmek isteriz.",
  varsayilan: "Birlikte olalım istedik. Gelirseniz çok seviniriz.",
};

/** Mevlidin vesilesine göre cümle; rahmetli için kutlama dili kullanılmaz. */
const MEVLID_VESILE: Record<string, string> = {
  bebek: "Bebeğimiz için okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz. Dualarınızla aramızda olmanızı dileriz.",
  ev: "Yeni evimizin hayırlı olması için okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz.",
  rahmetli: "Rahmetlimizin ruhuna okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz. Dualarınızla aramızda olmanızı dileriz.",
  sukur: "Rabbimize şükür vesilesiyle okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz.",
};

/** AI çalışmadığında kullanılacak metin. */
export function fallbackText(i: TextInput) {
  const ton = (i.answers.ton ?? "varsayilan") as keyof Tonlu;
  const tonlu = i.plan.toren ? TOREN_METNI : ETKINLIK_METNI[i.answers.tur ?? ""] ?? GENEL_ETKINLIK;
  if (i.plan.toren && ton === "manevi" && i.answers.tur !== "dugun")
    return sanitize("Allah'ın izniyle hayırlı bir yola çıkıyoruz. Bu mutlu günümüzde hayır dualarınızla aramızda olmanızı dileriz.");
  const ana =
    i.answers.tur === "mevlid" && MEVLID_VESILE[i.answers.vesile ?? ""]
      ? MEVLID_VESILE[i.answers.vesile ?? ""]
      : tonlu[ton] ?? tonlu.varsayilan;
  const parcalar = [ana];
  if (i.request) parcalar.push(/[.!?…]$/.test(i.request) ? i.request : `${i.request}.`);
  return sanitize(parcalar.join(" "));
}

/* ------------------------------------------------------------------ */
/* AI                                                                 */
/* ------------------------------------------------------------------ */

const SISTEM = `Türkçe davet metni yazıyorsun. Kısa, doğal ve Türkiye'de gerçekten kullanılan bir dille yaz.

Kurallar:
- En fazla 3 cümle, toplam 350 karakteri geçme.
- Sadece davet metnini yaz. Başlık, tırnak, emoji, imza, açıklama ekleme.
- Tarih ve yeri metinde tekrar yazma; davetiyede zaten ayrı gösteriliyor.
- Telefon numarası, IBAN, hesap bilgisi, para, hediye, bağış, bağlantı veya sosyal medya adresi asla yazma.
- "Kıymetli davetlimiz" gibi şablon kalıplardan kaçın; verilen bilgilere göre kişisel bir metin kur.
- Davetlinin adı metne girmez; davetiye onu ayrıca ekliyor.

Türkiye'ye özgü:
- Aile adları verildiyse metni ailelerin ağzından kur ("kızımız ... ile oğlumuz ..." gibi); büyükler bu dili bekler.
- "Manevi ve dualı" dil seçildiyse "Allah'ın izniyle", "hayır dualarınızla" gibi yerleşik ifadeler kullan; abartma, ayet yazma.
- Mevlid, iftar ve hac uğurlamasında neşeli ya da şakacı dil kullanma. Rahmetli anısına mevlidde kutlama sözcükleri (mutlu, kutlama, eğlence) kullanma.
- Sünnet ve diş buğdayında "maşallah" doğaldır; sünnette çocuğun ağzından yazmak yaygındır.
- Bekârlığa veda, cinsiyet partisi ve baby shower gibi yeni kutlamalarda rahat, güncel bir dil uygundur.`;

function istek(i: TextInput) {
  const satirlar = [
    `Davet türü: ${i.plan.toren ? "tören daveti" : "etkinlik daveti"}`,
    i.plan.toren ? `Çift: ${i.heading}` : `Etkinlik adı: ${i.heading}`,
    i.host ? `Ev sahibi: ${i.host}` : "",
    `Tarih: ${i.dateLabel}`,
    `Yer: ${i.venue}${i.city ? `, ${i.city}` : ""}`,
    i.greeting ? `Davet cümlesinde geçen ifade: ${i.greeting}` : "",
    i.families ? `Aileler: ${i.families}` : "",
    i.request ? `Davetlilerden istek: ${i.request}` : "",
    "",
    "Ev sahibinin sihirbazda verdiği cevaplar:",
    ...answerSummary(i.answers).map((s) => `- ${s}`),
    "",
    "Bu cevaplara uyan davet metnini yaz.",
  ];
  return satirlar.filter((s) => s !== "").join("\n");
}

/** AI metni. Anahtar yoksa ya da bir şey ters giderse null döner. */
async function aiText(i: TextInput): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SISTEM,
      messages: [{ role: "user", content: istek(i) }],
    });
    const text = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join(" ")
      .trim();
    const temiz = sanitize(text);
    // Süzgeç metnin yarısından fazlasını attıysa metne güvenme
    return temiz.length >= 40 && temiz.length >= text.trim().length / 2 ? temiz : null;
  } catch (e) {
    console.error("[ai] davet metni yazılamadı:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Davet metnini üretir. Her zaman bir metin döner. */
export async function writeInvitationText(i: TextInput) {
  const ai = await aiText(i);
  return { text: ai ?? fallbackText(i), source: ai ? ("ai" as const) : ("hazir" as const) };
}
