import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sihirbaz } from "@/components/Sihirbaz";
import { answersQuery, nextQuestion, parseAnswers } from "@/lib/wizard";

export const metadata: Metadata = {
  title: "Davetini hazırlayalım – Buyrun",
  description: "Birkaç soru soralım, davetinizi size göre hazırlayalım.",
};

type SP = Record<string, string | string[] | undefined>;

/**
 * Sihirbaz: sayfa başına tek soru, tek dokunuş.
 *
 * Sunucu, adres satırındaki cevaplarla ilk soruyu çizer; sonrasını tarayıcı canlı
 * yürütür (geçiş animasyonları, anlık renk değişimi). JavaScript kapalıysa her seçenek
 * gerçek bir link olduğu için sihirbaz yine baştan sona çalışır.
 */
export default async function Basla({ searchParams }: { searchParams: Promise<SP> }) {
  const answers = parseAnswers(await searchParams);
  if (!nextQuestion(answers)) redirect(`/basla/bilgiler?${answersQuery(answers)}`);
  return <Sihirbaz initial={answers} />;
}
