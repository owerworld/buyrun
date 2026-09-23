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

const TON: Record<string, { toren: (i: TextInput) => string; etkinlik: (i: TextInput) => string }> = {
  zarif: {
    toren: (i) => `Hayatımızın en güzel gününde sizi de yanımızda görmek bizim için ayrı bir mutluluk olacak. ${i.dateLabel} günü ${i.venue}'de sizi bekliyoruz.`,
    etkinlik: (i) => `Sizi ${i.dateLabel} günü ${i.venue}'de aramızda görmek isteriz. Gelmeniz bizim için değerli.`,
  },
  sicak: {
    toren: (i) => `Bu güzel günü sevdiklerimizle paylaşmak istiyoruz. ${i.dateLabel} günü ${i.venue}'de sizi de aramızda görmek bizi çok mutlu eder.`,
    etkinlik: (i) => `${i.dateLabel} günü ${i.venue}'de birlikte olalım istedik. Gelirseniz çok seviniriz.`,
  },
  neseli: {
    toren: (i) => `Uzun zamandır beklediğimiz gün geldi! ${i.dateLabel} günü ${i.venue}'de bol müzik, bol kahkaha ve sizin de orada olmanızı istiyoruz.`,
    etkinlik: (i) => `${i.dateLabel} günü ${i.venue}'de güzel bir gün olacak. Sizi de bekliyoruz!`,
  },
};

/** AI çalışmadığında kullanılacak metin. */
export function fallbackText(i: TextInput) {
  const ton = TON[i.answers.ton ?? "sicak"] ?? TON.sicak;
  const parcalar = [i.plan.toren ? ton.toren(i) : ton.etkinlik(i)];
  if (i.city && i.plan.toren) parcalar.push("");
  if (i.request) parcalar.push(i.request);
  return sanitize(parcalar.filter(Boolean).join(" "));
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
- Davetlinin adı metne girmez; davetiye onu ayrıca ekliyor.`;

function istek(i: TextInput) {
  const satirlar = [
    `Davet türü: ${i.plan.toren ? "tören daveti" : "etkinlik daveti"}`,
    i.plan.toren ? `Çift: ${i.heading}` : `Etkinlik adı: ${i.heading}`,
    i.host ? `Ev sahibi: ${i.host}` : "",
    `Tarih: ${i.dateLabel}`,
    `Yer: ${i.venue}${i.city ? `, ${i.city}` : ""}`,
    i.greeting ? `Davet cümlesinde geçen ifade: ${i.greeting}` : "",
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
