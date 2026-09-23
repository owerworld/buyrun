import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { COVERS } from "@/components/CoverPicker";
import { ThemeStyle } from "@/components/Theme";
import { WizardPreview } from "@/components/WizardPreview";
import { fontOf, ornamentOf } from "@/lib/design";
import { kindOf } from "@/lib/events";
import { todayIso } from "@/lib/format";
import { themeOf } from "@/lib/themes";
import { answersQuery, nextQuestion, parseAnswers, planFromAnswers, withoutLast } from "@/lib/wizard";
import { wizardAction } from "../actions";

export const metadata: Metadata = { title: "Son bilgiler – Buyrun" };

type SP = Record<string, string | string[] | undefined>;

/**
 * Sihirbazın son sayfası: yazı isteyen tek yer.
 *
 * Hangi alanların görüneceğine cevaplar karar verir — servis seçmediyse servis
 * alanı, ikinci gün seçmediyse kına alanı hiç açılmaz. Klavye ne kadar az
 * açılırsa davet o kadar çok tamamlanıyor.
 */
export default async function Bilgiler({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const answers = parseAnswers(sp);
  // Eksik cevap varsa soruya geri dön
  if (nextQuestion(answers)) redirect(`/basla?${answersQuery(answers)}`);

  const hata = typeof sp.hata === "string" ? sp.hata : "";
  const plan = planFromAnswers(answers);
  const query = answersQuery(answers);
  const main = plan.toren ? kindOf(plan.mainKind) : null;
  const extra = plan.extraKind ? kindOf(plan.extraKind) : null;
  const ozet = plan.toren
    ? `${themeOf(plan.theme).label} renkler, ${ornamentOf(plan.ornament).label.toLocaleLowerCase("tr")} ve ${fontOf(plan.font).label.toLocaleLowerCase("tr")} isimler`
    : `${COVERS.find((c) => c.id === plan.coverId)?.label ?? "Kapak"} kapağı · ${plan.category}`;

  return (
    <main className="wrap form-wrap bilgiler">
      {plan.toren && <ThemeStyle theme={plan.theme} />}
      <div className="brand">
        <Link href="/">Buyrun</Link>
        <Link className="back-link" href={`/basla?${answersQuery(withoutLast(answers))}`}>← Geri</Link>
      </div>
      <div className="bilgiler-onizleme">
        <WizardPreview answers={answers} plan={plan} />
      </div>

      <form action={wizardAction} className="card">
        <p className="eyebrow">Son adım</p>
        <h1 className="title">Davetiyeniz hazır, isimleri yazalım</h1>
        <p className="muted">
          Cevaplarınızdan çıkan tasarım: <b>{ozet}</b>. Davet metnini de biz yazacağız;
          hepsini sonradan değiştirebilirsiniz.
        </p>
        {hata && <p className="err" role="alert">{hata}</p>}

        {/* Cevaplar "c_" önekiyle taşınır: "program" gibi bir cevap adı, aynı adlı metin kutusuyla çakışmasın. */}
        {Object.entries(answers).map(([k, v]) => <input key={k} type="hidden" name={`c_${k}`} value={v} />)}

        {plan.toren ? (
          <>
            <div className="grid2">
              <div><label className="lbl" htmlFor="nameA">Gelinin adı</label><input type="text" id="nameA" name="nameA" required maxLength={40} autoComplete="off" /></div>
              <div><label className="lbl" htmlFor="nameB">Damadın adı</label><input type="text" id="nameB" name="nameB" required maxLength={40} autoComplete="off" /></div>
            </div>
            <label className="lbl" htmlFor="city">Şehir</label>
            <input type="text" id="city" name="city" maxLength={40} placeholder="Örn: Bursa" />

            <div className="form-section-heading"><span>·</span><h2>{main?.title}</h2></div>
            <div className="grid2">
              <div><label className="lbl" htmlFor="d_date">Tarih</label><input type="date" id="d_date" name="d_date" required min={todayIso()} /></div>
              <div><label className="lbl" htmlFor="d_time">Saat</label><input type="time" id="d_time" name="d_time" required /></div>
            </div>
            <label className="lbl" htmlFor="d_venue">Salon / yer</label>
            <input type="text" id="d_venue" name="d_venue" required maxLength={80} />
            <label className="lbl" htmlFor="d_address">Adres</label>
            <input type="text" id="d_address" name="d_address" maxLength={120} placeholder="İlçe, şehir" />

            {extra && (
              <>
                <div className="form-section-heading"><span>·</span><h2>{extra.title}</h2></div>
                <div className="grid2">
                  <div><label className="lbl" htmlFor="k_date">Tarih</label><input type="date" id="k_date" name="k_date" required min={todayIso()} /></div>
                  <div><label className="lbl" htmlFor="k_time">Saat</label><input type="time" id="k_time" name="k_time" required /></div>
                </div>
                <label className="lbl" htmlFor="k_venue">Yer</label>
                <input type="text" id="k_venue" name="k_venue" required maxLength={80} placeholder="Örn: Kız evi" />
                <label className="lbl" htmlFor="k_address">Adres</label>
                <input type="text" id="k_address" name="k_address" maxLength={120} />
              </>
            )}

            {plan.wantsBus && (
              <>
                <div className="form-section-heading"><span>·</span><h2>Servis</h2></div>
                <div className="grid2">
                  <div><label className="lbl" htmlFor="busFrom">Kalkış yeri</label><input type="text" id="busFrom" name="busFrom" maxLength={120} placeholder="Örn: Heykel meydanı" /></div>
                  <div><label className="lbl" htmlFor="busTime">Kalkış saati</label><input type="time" id="busTime" name="busTime" /></div>
                </div>
                <label className="lbl" htmlFor="busNote">Servis notu</label>
                <input type="text" id="busNote" name="busNote" maxLength={160} placeholder="Örn: Dönüş 23:30'da salondan" />
              </>
            )}

            {plan.wantsProgram && (
              <>
                <div className="form-section-heading"><span>·</span><h2>Günün programı</h2></div>
                <label className="lbl" htmlFor="program">{main?.title} günü</label>
                <textarea id="program" name="program" maxLength={600} placeholder={"Her satıra bir madde:\n15:00 Gelin alma\n19:00 Nikâh töreni"} />
                {extra && (
                  <>
                    <label className="lbl" htmlFor="k_program">{extra.title}</label>
                    <textarea id="k_program" name="k_program" maxLength={600} placeholder={"20:00 Karşılama\n21:30 Kına yakma"} />
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <label className="lbl" htmlFor="title">Etkinliğin adı</label>
            <input type="text" id="title" name="title" required maxLength={100} placeholder="Örn: İyi ki doğdun, Ece!" />
            <label className="lbl" htmlFor="hostName">Ev sahibi</label>
            <input type="text" id="hostName" name="hostName" required maxLength={80} placeholder="Örn: Ece ya da Bilgisayar Kulübü" />

            <div className="grid2">
              <div><label className="lbl" htmlFor="date">Tarih</label><input type="date" id="date" name="date" required min={todayIso()} /></div>
              <div><label className="lbl" htmlFor="time">Saat</label><input type="time" id="time" name="time" required /></div>
            </div>
            <label className="lbl" htmlFor="venue">Yer</label>
            <input type="text" id="venue" name="venue" required maxLength={160} placeholder="Örn: Moda Teras" />
            <label className="lbl" htmlFor="address">Adres</label>
            <input type="text" id="address" name="address" maxLength={400} placeholder="Mahalle, ilçe, şehir" />

            {plan.request === "getir" && (
              <>
                <label className="lbl" htmlFor="request">Ne getirsinler?</label>
                <input type="text" id="request" name="request" maxLength={160} placeholder="Örn: Yanınızda bir tatlı getirin" />
              </>
            )}
            {plan.request === "kiyafet" && (
              <>
                <label className="lbl" htmlFor="request">Kıyafet notu</label>
                <input type="text" id="request" name="request" maxLength={160} placeholder="Örn: Beyaz giymemenizi rica ederiz" />
              </>
            )}

            <label className="lbl" htmlFor="capacity">Kontenjan (isteğe bağlı)</label>
            <input type="number" id="capacity" name="capacity" min={1} max={10000} inputMode="numeric" placeholder="Örn: 40" style={{ width: 140 }} />
          </>
        )}

        <label className="tog small" style={{ marginTop: 18 }}>
          <input type="checkbox" name="kvkk" required />
          <span><Link href="/gizlilik" target="_blank">Aydınlatma metnini</Link> okudum. Davetli bilgilerinin son etkinlikten 90 gün sonra silineceğini biliyorum.</span>
        </label>
        <button className="btn full" type="submit" style={{ marginTop: 16 }}>Davetimi hazırla</button>
        <p className="muted small centered" style={{ marginTop: 10 }}>
          Metni ve görünümü sonradan istediğiniz kadar değiştirebilirsiniz.
        </p>
      </form>

      <p className="muted small centered" style={{ marginTop: 14 }}>
        Sorulara dönmek isterseniz <Link href={`/basla?${query}`}>buradan</Link> geri gidebilirsiniz.
      </p>
    </main>
  );
}
