"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { COVERS } from "@/components/CoverPicker";
import { OrnamentSwatch, PatternSwatch } from "@/components/Ornament";
import { ThemeStyle } from "@/components/Theme";
import { WizardPreview } from "@/components/WizardPreview";
import { fontOf, ornamentOf, patternOf } from "@/lib/design";
import { themeOf } from "@/lib/themes";
import {
  answersQuery, nextQuestion, parseAnswers, planFromAnswers, progress, visibleOptions, withoutLast,
  type Answers, type Option, type Question,
} from "@/lib/wizard";

const GRUP_BASLIK: Record<string, string> = {
  evlilik: "Evlilik yolunda hangi gün?",
  cocuk: "Hangi kutlama?",
  manevi: "Hangi gün için?",
  dostlar: "Ne için toplanıyoruz?",
};

/**
 * Cevaba verilen kısa karşılık. Kullanıcı söylediğinin duyulduğunu görür; sınav hissi
 * yerine sohbet hissi. Uydurma istatistik ya da övgü yok, yalnızca ne yapılacağı.
 */
function tepki(qid: string, v: string, a: Answers): string {
  const plan = planFromAnswers(a);
  switch (qid) {
    case "kim": return v === "buyukler" ? "Büyüklere yakışan, saygılı bir dil kuracağız." : v === "arkadaslar" ? "Samimi ve rahat bir dil, anlaşıldı." : "Herkese uyan bir dil kuracağız.";
    case "ton": return v === "manevi" ? "Dualarla dolu bir davet olacak." : v === "neseli" ? "Neşeli bir dil, güzel seçim!" : v === "zarif" ? "Zarif ve ölçülü, not aldık." : "İçten bir dil, not aldık.";
    case "aile": return v === "evet" ? "Ailelerinizin adı en üstte yer alacak." : "Sade ve modern, sadece sizin adınız.";
    case "renk": return `${themeOf(plan.theme).label} renkler davetiyenize işlendi.`;
    case "stil": case "hava": return `${ornamentOf(plan.ornament).label} çerçeveye yerleşti.`;
    case "desen": {
      const d = patternOf(plan.pattern);
      return d.id === "sade" ? "Sade bir zemin, renkler öne çıkacak." : `${d.label} arka plana işlendi: ${d.hint.toLocaleLowerCase("tr")}.`;
    }
    case "yazi": return `İsimleriniz ${fontOf(plan.font).label.toLocaleLowerCase("tr")} yazıyla yazıldı.`;
    case "ikinci": return v === "tek" ? "Tek gün, not aldık." : "İkinci gün de davetiyede yer alacak.";
    case "vesile": return v === "rahmetli" ? "Allah rahmet eylesin. Metni buna uygun, sade yazacağız." : "Not aldık.";
    case "kalabalik": return "Son dokunuşlar yapılıyor…";
    default: return "";
  }
}

/** Seçeneğin görsel kısmı: seçilirse davetiyeye ne olacağını gösterir. */
function Gorsel({ q, o, answers }: { q: Question; o: Option; answers: Answers }) {
  const plan = planFromAnswers({ ...answers, [q.id]: o.id });
  switch (q.look) {
    case "renk": {
      const [a, b, c] = themeOf(plan.theme).swatch;
      return <span className={`renk-ornek${o.id === "sizsecin" ? " belirsiz" : ""}`} aria-hidden="true" style={{ background: `conic-gradient(${a} 0 50%, ${b} 0 75%, ${c} 0)` }} />;
    }
    case "susleme":
      return <OrnamentSwatch kind={plan.ornament} />;
    case "desen":
      return <PatternSwatch kind={plan.pattern} />;
    case "yazi":
      return <span className="yazi-ornek" aria-hidden="true" style={fontOf(plan.font).sample}>Defne &amp; Mert</span>;
    case "kapak": {
      const cover = COVERS.find((c) => c.id === plan.coverId) ?? COVERS[0];
      return <span className="kapak-kucuk" aria-hidden="true"><Image src={cover.src} alt="" fill sizes="120px" /></span>;
    }
    default:
      return null;
  }
}

const hareketAz = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Tasarımın hangi ekseni değişti: önizlemenin altında kısa bir not olarak görünür. */
function degisim(once: Answers, sonra: Answers) {
  const a = planFromAnswers(once), b = planFromAnswers(sonra);
  if (!b.toren && !sonra.tur) return "";
  if (a.theme !== b.theme) return `Renk: ${themeOf(b.theme).label}`;
  if (a.ornament !== b.ornament) return `Süsleme: ${ornamentOf(b.ornament).label}`;
  if (a.font !== b.font) return `Yazı: ${fontOf(b.font).label}`;
  if (a.pattern !== b.pattern) return `Doku: ${patternOf(b.pattern).label}`;
  return "";
}

export function Sihirbaz({ initial }: { initial: Answers }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initial);
  const [yon, setYon] = useState<"ileri" | "geri">("ileri");
  const [secilen, setSecilen] = useState<string | null>(null);
  const [karsilik, setKarsilik] = useState("");
  const [not, setNot] = useState("");
  const [hazirlaniyor, setHazirlaniyor] = useState(false);
  const [adim, setAdim] = useState(0);
  const kilit = useRef(false);

  const q = nextQuestion(answers);
  const plan = planFromAnswers(answers);
  const { done, total } = progress(answers);
  const canli = Boolean(answers.tur);

  // Tarayıcının geri tuşu: adres satırındaki cevaplara dön
  useEffect(() => {
    const geriGel = () => {
      const a = parseAnswers(Object.fromEntries(new URLSearchParams(window.location.search)));
      setYon("geri");
      setKarsilik("");
      setAnswers(a);
    };
    window.addEventListener("popstate", geriGel);
    return () => window.removeEventListener("popstate", geriGel);
  }, []);

  const bitir = useCallback((son: Answers) => {
    const hedef = `/basla/bilgiler?${answersQuery(son)}`;
    router.prefetch(hedef);
    if (hareketAz()) { router.push(hedef); return; }
    setHazirlaniyor(true);
    // Hazırlık adımları tek tek işaretlenir; kullanıcı cevaplarının işlendiğini görür
    [1, 2, 3, 4].forEach((n) => setTimeout(() => setAdim(n), n * 420));
    setTimeout(() => router.push(hedef), 2100);
  }, [router]);

  function sec(e: React.MouseEvent, qid: string, v: string) {
    e.preventDefault();
    if (kilit.current) return;
    kilit.current = true;
    setSecilen(v);
    navigator.vibrate?.(8);
    const sonra = { ...answers, [qid]: v };
    setTimeout(() => {
      kilit.current = false;
      setSecilen(null);
      setYon("ileri");
      setKarsilik(tepki(qid, v, sonra));
      setNot(degisim(answers, sonra));
      if (!nextQuestion(sonra)) { setAnswers(sonra); bitir(sonra); return; }
      window.history.pushState(null, "", `/basla?${answersQuery(sonra)}`);
      setAnswers(sonra);
    }, hareketAz() ? 0 : 260);
  }

  function geri(e: React.MouseEvent) {
    if (done === 0) return; // ana sayfaya giden gerçek link
    e.preventDefault();
    const once = withoutLast(answers);
    setYon("geri");
    setKarsilik("");
    setNot("");
    window.history.pushState(null, "", `/basla?${answersQuery(once)}`);
    setAnswers(once);
  }

  // Yeni soruda başa dön: telefonda önizlemedeki değişim ve yeni soru birlikte görünsün
  const ilk = useRef(true);
  useEffect(() => {
    if (ilk.current) { ilk.current = false; return; }
    if (window.scrollY > 40) window.scrollTo({ top: 0, behavior: hareketAz() ? "auto" : "smooth" });
  }, [q?.id]);

  // Değişim notu birkaç saniye sonra kaybolur
  useEffect(() => {
    if (!not) return;
    const t = setTimeout(() => setNot(""), 2600);
    return () => clearTimeout(t);
  }, [not]);

  if (hazirlaniyor) {
    const adimlar = plan.toren
      ? ["Renkleriniz seçildi", "Çerçeve süslendi", "İsimler yazıldı", "Davet metni hazırlanıyor"]
      : ["Renkleriniz seçildi", "Çerçeve süslendi", "Başlık yazıldı", "Davet metni hazırlanıyor"];
    return (
      <main className="sihirbaz hazirlik">
        <ThemeStyle theme={plan.theme} />
        <div className="hazirlik-onizleme"><WizardPreview answers={answers} plan={plan} /></div>
        <h1 className="soru-baslik">Davetiyeniz hazırlanıyor</h1>
        <ul className="hazirlik-liste" aria-live="polite">
          {adimlar.map((m, i) => (
            <li key={m} className={adim > i ? "tamam" : ""}><span className="tik" aria-hidden="true">✓</span>{m}</li>
          ))}
        </ul>
      </main>
    );
  }

  if (!q) return null;
  const baslik = q.id === "tur" && answers.grup ? GRUP_BASLIK[answers.grup] ?? q.title : q.title;
  const look = q.look ?? "liste";
  const geriHref = done === 0 ? "/" : `/basla?${answersQuery(withoutLast(answers))}`;

  return (
    <main className={`sihirbaz${canli ? " canli-var" : ""}`}>
      {canli && <ThemeStyle theme={plan.theme} />}
      <div className="sihirbaz-isik" aria-hidden="true" />
      <div className="brand">
        <Link href="/">Buyrun</Link>
        <Link className="back-link" href={geriHref} onClick={geri}>← Geri</Link>
      </div>

      <div className="adim" role="group" aria-label={`Toplam ${total} sorudan ${done + 1}. soru`}>
        <div className="adim-bar"><span style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
        <p className="adim-sayi">{done + 1} / {total}</p>
      </div>

      <div className="sihirbaz-govde">
        <section className={`soru ${yon}`} key={q.id}>
          {karsilik && <p className="karsilik" role="status">{karsilik}</p>}
          <h1 className="soru-baslik">{baslik}</h1>
          {q.lead && <p className="soru-alt">{q.lead}</p>}
          <div className={`secimler look-${look}${secilen ? " secim-yapildi" : ""}`}>
            {visibleOptions(q, answers).map((o, i) => (
              <Link
                key={o.id}
                className={`secim${secilen === o.id ? " secildi" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
                href={`/basla?${answersQuery({ ...answers, [q.id]: o.id })}`}
                onClick={(e) => sec(e, q.id, o.id)}
                aria-current={secilen === o.id ? "true" : undefined}
              >
                <Gorsel q={q} o={o} answers={answers} />
                <span className="secim-yazi">
                  <b>{o.label}</b>
                  {o.hint && <small>{o.hint}</small>}
                </span>
                <span className="secim-tik" aria-hidden="true">✓</span>
              </Link>
            ))}
          </div>
          {done === 0 && <p className="soru-not">Yazı yazmak yok, sadece seçin. İsim ve tarihi en sonda bir kerede alacağız.</p>}
        </section>

        {canli && (
          <aside className="canli" aria-label="Davetiyenizin önizlemesi">
            <p className="canli-etiket">Davetiyeniz şekilleniyor</p>
            <div className="onizleme-kutu" key={`${plan.ornament}-${plan.font}-${plan.pattern}`}>
              <WizardPreview answers={answers} plan={plan} />
            </div>
            <p className={`degisim${not ? " gorunur" : ""}`} aria-live="polite">{not && <>✓ {not}</>}</p>
          </aside>
        )}
      </div>
    </main>
  );
}
