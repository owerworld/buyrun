import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { answersQuery, nextQuestion, parseAnswers, progress, withoutLast } from "@/lib/wizard";

export const metadata: Metadata = {
  title: "Davetini hazırlayalım – Buyrun",
  description: "Birkaç soru soralım, davetinizi size göre hazırlayalım.",
};

type SP = Record<string, string | string[] | undefined>;

/**
 * Sihirbaz: sayfa başına tek soru, tek dokunuş.
 *
 * Cevaplar adres satırında taşınır; sayfanın JavaScript'e ihtiyacı yok, geri tuşu
 * doğal çalışır, yarıda kalan bir davet linki paylaşılıp kaldığı yerden sürebilir.
 */
export default async function Basla({ searchParams }: { searchParams: Promise<SP> }) {
  const answers = parseAnswers(await searchParams);
  const q = nextQuestion(answers);
  // Bütün sorular bittiyse sıra yazılı bilgilerde
  if (!q) redirect(`/basla/bilgiler?${answersQuery(answers)}`);

  const { done, total } = progress(answers);
  const step = done + 1;
  const geri = done === 0 ? "/" : `/basla?${answersQuery(withoutLast(answers))}`;

  return (
    <main className="wrap sihirbaz">
      <div className="brand">
        <Link href="/">Buyrun</Link>
        <Link className="back-link" href={geri}>← Geri</Link>
      </div>

      <div className="adim" role="group" aria-label={`Toplam ${total} sorudan ${step}. soru`}>
        <div className="adim-bar"><span style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
        <p className="adim-sayi">{step} / {total}</p>
      </div>

      <h1 className="title">{q.title}</h1>
      {q.lead && <p className="muted">{q.lead}</p>}

      <div className="sorular">
        {q.options.map((o) => (
          <Link key={o.id} className="soru-secenek" href={`/basla?${answersQuery({ ...answers, [q.id]: o.id })}`}>
            <span>
              <b>{o.label}</b>
              {o.hint && <small>{o.hint}</small>}
            </span>
            <span className="ok" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <p className="muted small centered" style={{ marginTop: 22 }}>
        Yazı yazmak yok, sadece seçin. İsim ve tarihi en sonda bir kerede alacağız.
      </p>
    </main>
  );
}
