import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { COVERS } from "@/components/CoverPicker";
import { OrnamentSwatch } from "@/components/Ornament";
import { ThemeStyle } from "@/components/Theme";
import { WizardPreview } from "@/components/WizardPreview";
import { fontOf } from "@/lib/design";
import { themeOf } from "@/lib/themes";
import {
  answersQuery, nextQuestion, parseAnswers, planFromAnswers, progress, withoutLast,
  type Answers, type Option, type Question,
} from "@/lib/wizard";

export const metadata: Metadata = {
  title: "Davetini hazırlayalım – Buyrun",
  description: "Birkaç soru soralım, davetinizi size göre hazırlayalım.",
};

type SP = Record<string, string | string[] | undefined>;

/** Seçeneğin görsel kısmı. Her kart, o seçeneğin davetiyeye ne yapacağını gösterir. */
function Gorsel({ q, o, answers }: { q: Question; o: Option; answers: Answers }) {
  // Seçenek seçilmiş gibi planı hesapla: "siz seçin" bile gerçek sonucunu gösterir
  const plan = planFromAnswers({ ...answers, [q.id]: o.id });
  switch (q.look) {
    case "renk": {
      const [a, b, c] = themeOf(plan.theme).swatch;
      return (
        <span className={`renk-ornek${o.id === "sizsecin" ? " belirsiz" : ""}`} aria-hidden="true"
          style={{ background: `conic-gradient(${a} 0 50%, ${b} 0 75%, ${c} 0)` }} />
      );
    }
    case "susleme":
      return <OrnamentSwatch kind={plan.ornament} />;
    case "yazi":
      return <span className="yazi-ornek" aria-hidden="true" style={fontOf(plan.font).sample}>Defne &amp; Mert</span>;
    case "kapak": {
      const cover = COVERS.find((c) => c.id === plan.coverId) ?? COVERS[0];
      return (
        <span className="kapak-kucuk" aria-hidden="true">
          <Image src={cover.src} alt="" fill sizes="120px" />
        </span>
      );
    }
    default:
      return null;
  }
}

/**
 * Sihirbaz: sayfa başına tek soru, tek dokunuş.
 *
 * Cevaplar adres satırında taşınır; sayfanın JavaScript'e ihtiyacı yok, geri tuşu
 * doğal çalışır. Renk seçildiği anda sayfanın kendisi de o renklere bürünür.
 */
export default async function Basla({ searchParams }: { searchParams: Promise<SP> }) {
  const answers = parseAnswers(await searchParams);
  const q = nextQuestion(answers);
  if (!q) redirect(`/basla/bilgiler?${answersQuery(answers)}`);

  const plan = planFromAnswers(answers);
  const { done, total } = progress(answers);
  const step = done + 1;
  const geri = done === 0 ? "/" : `/basla?${answersQuery(withoutLast(answers))}`;
  const look = q.look ?? "liste";
  const canli = Boolean(answers.tur);

  return (
    <main className={`sihirbaz${canli ? " canli-var" : ""}`}>
      {plan.toren && <ThemeStyle theme={plan.theme} />}
      <div className="brand">
        <Link href="/">Buyrun</Link>
        <Link className="back-link" href={geri}>← Geri</Link>
      </div>

      <div className="adim" role="group" aria-label={`Toplam ${total} sorudan ${step}. soru`}>
        <div className="adim-bar"><span style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
        <p className="adim-sayi">{step} / {total}</p>
      </div>

      <div className="sihirbaz-govde">
        <section className="soru">
          <h1 className="soru-baslik">{q.title}</h1>
          {q.lead && <p className="soru-alt">{q.lead}</p>}

          <div className={`secimler look-${look}`}>
            {q.options.map((o) => (
              <Link key={o.id} className="secim" href={`/basla?${answersQuery({ ...answers, [q.id]: o.id })}`}>
                <Gorsel q={q} o={o} answers={answers} />
                <span className="secim-yazi">
                  <b>{o.label}</b>
                  {o.hint && <small>{o.hint}</small>}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {canli && (
          <aside className="canli" aria-label="Davetiyenizin önizlemesi">
            <p className="canli-etiket">Davetiyeniz şekilleniyor</p>
            <WizardPreview answers={answers} plan={plan} />
          </aside>
        )}
      </div>

      {done === 0 && (
        <p className="soru-not">Yazı yazmak yok, sadece seçin. İsim ve tarihi en sonda bir kerede alacağız.</p>
      )}
    </main>
  );
}
