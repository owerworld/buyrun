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
/** Renkli, coşkulu kapağın yakışmadığı günler: "hava" sorulmaz. */
const MANEVI = ["mevlid", "iftar"];

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
      { id: "zarif", label: "Zarif ve ölçülü" },
      { id: "sicak", label: "Sıcak ve içten" },
      { id: "neseli", label: "Neşeli ve esprili" },
      {
        id: "manevi",
        label: "Manevi ve dualı",
        hint: "“Allah'ın izniyle… Hayır dualarınızı bekleriz.”",
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
  };
}
