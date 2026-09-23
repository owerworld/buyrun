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
}

export interface Question {
  id: string;
  /** Soru başlığı */
  title: string;
  /** Başlığın altındaki kısa cümle */
  lead?: string;
  options: Option[];
  /** Bu soru yalnızca koşul sağlanırsa sorulur */
  when?: (a: Answers) => boolean;
}

/** Düğün, nişan ve söz aynı "tören" dalında ilerler. */
export const TOREN = ["dugun", "nisan", "soz"];
export const isToren = (a: Answers) => TOREN.includes(a.tur ?? "");

export const QUESTIONS: Question[] = [
  {
    id: "tur",
    title: "Ne kutluyoruz?",
    lead: "Buradan sonrası size göre şekillenecek.",
    options: [
      { id: "dugun", label: "Düğün", hint: "Nikâh ve düğün" },
      { id: "nisan", label: "Nişan" },
      { id: "soz", label: "Söz" },
      { id: "kina", label: "Kına gecesi", hint: "Tek başına kına daveti" },
      { id: "dogumgunu", label: "Doğum günü" },
      { id: "mezuniyet", label: "Mezuniyet" },
      { id: "evpartisi", label: "Ev partisi" },
      { id: "yemek", label: "Akşam yemeği" },
      { id: "bulusma", label: "Buluşma" },
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
      { id: "zarif", label: "Zarif ve ölçülü" },
      { id: "sicak", label: "Sıcak ve içten" },
      { id: "neseli", label: "Neşeli ve esprili" },
    ],
  },
  {
    id: "stil",
    title: "Davetiye nasıl görünsün?",
    lead: "Şıklık mı, sizin tarzınız mı?",
    when: isToren,
    options: [
      { id: "klasik", label: "Klasik ve görkemli", hint: "Bordo, altın, sırma" },
      { id: "sade", label: "Sade ve zarif", hint: "Kum beji, zeytin yeşili" },
      { id: "modern", label: "Modern ve gece", hint: "Lacivert, altın" },
      { id: "bilmiyorum", label: "Karar veremedim", hint: "Cevaplarınıza göre biz seçelim" },
    ],
  },
  {
    id: "hava",
    title: "Nasıl bir hava olsun?",
    when: (a) => !isToren(a),
    options: [
      { id: "cosku", label: "Coşkulu ve renkli" },
      { id: "sicakhava", label: "Küçük ve samimi" },
      { id: "sik", label: "Şık ve sakin" },
    ],
  },
  {
    id: "ikinci",
    title: "Tek gün mü, iki gün mü?",
    lead: "Kına gecesi ya da after party ekleyebilirsiniz.",
    when: isToren,
    options: [
      { id: "tek", label: "Tek gün" },
      { id: "kina", label: "Kına gecesi de var" },
      { id: "after", label: "After party de var" },
    ],
  },
  {
    id: "servis",
    title: "Davetliler için servis kalkacak mı?",
    when: (a) => isToren(a),
    options: [
      { id: "var", label: "Evet, servis olacak" },
      { id: "yok", label: "Hayır" },
    ],
  },
  {
    id: "program",
    title: "Günün programını paylaşmak ister misiniz?",
    lead: "Gelin alma, nikâh, ilk dans gibi saatler.",
    when: isToren,
    options: [
      { id: "var", label: "Evet, saatleri yazacağım" },
      { id: "yok", label: "Gerek yok" },
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
      { id: "kucuk", label: "20 kişiye kadar" },
      { id: "orta", label: "20 – 100 kişi" },
      { id: "buyuk", label: "100 – 300 kişi" },
      { id: "cokbuyuk", label: "300 kişiden fazla" },
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
}

const CATEGORY_OF: Record<string, string> = {
  dugun: "Düğün", nisan: "Düğün", soz: "Düğün",
  kina: "Kına gecesi", dogumgunu: "Doğum günü", mezuniyet: "Mezuniyet",
  evpartisi: "Ev partisi", yemek: "Akşam yemeği", bulusma: "Buluşma",
};

/** Tören dalında tema: önce açık seçim, "karar veremedim" derse tondan türetilir. */
function themeFor(a: Answers) {
  const direct: Record<string, string> = { klasik: "klasik", sade: "krem", modern: "gece" };
  if (direct[a.stil ?? ""]) return direct[a.stil];
  if (a.ton === "zarif") return "krem";
  if (a.ton === "neseli") return "gece";
  return "klasik";
}

/** Etkinlik dalında kapak: önce türün doğal karşılığı, sonra istenen hava. */
function coverFor(a: Answers) {
  if (a.tur === "dogumgunu") return "cherry";
  if (a.tur === "yemek") return "midnight";
  if (a.tur === "mezuniyet" || a.tur === "kina") return "bloom";
  if (a.hava === "cosku") return "cherry";
  if (a.hava === "sik") return "midnight";
  return "bloom";
}

export function planFromAnswers(a: Answers): Plan {
  const toren = isToren(a);
  return {
    toren,
    mainKind: toren ? a.tur : "",
    extraKind: a.ikinci === "kina" ? "kina" : a.ikinci === "after" ? "after" : "",
    theme: themeFor(a),
    coverId: coverFor(a),
    category: CATEGORY_OF[a.tur ?? ""] ?? "Buluşma",
    wantsBus: toren && a.servis === "var",
    wantsProgram: toren && a.program === "var",
    request: !toren && a.istek && a.istek !== "yok" ? a.istek : "",
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
