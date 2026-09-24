import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeStyle } from "@/components/Theme";
import { VenuePicker } from "@/components/VenuePicker";
import { CanliOnizleme } from "@/components/CanliOnizleme";
import { FotoSecici } from "@/components/FotoSecici";
import { fontOf, ornamentOf } from "@/lib/design";
import { kindOf } from "@/lib/events";
import { todayIso } from "@/lib/format";
import { themeOf } from "@/lib/themes";
import { alanlarFor, istekOrnekleri } from "@/lib/ornekler";
import { answersQuery, buyukHarf, davetAdi, nextQuestion, parseAnswers, planFromAnswers, withoutLast } from "@/lib/wizard";
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
  const aday = plan.mainKind === "dugun" ? "" : " adayının";
  const mainTitle = plan.extraKind === "nikah" ? "Düğün Töreni" : main?.title;
  const extraOrnek: Record<string, [yer: string, program: string]> = {
    kina: ["Örn: Kız evi ya da davet salonu", "20:00 Karşılama\n21:00 Gelin çıkışı\n21:30 Kına yakma"],
    nikah: ["Örn: Nilüfer Belediyesi Nikâh Salonu", "14:00 Nikâh\n14:30 Tebrikler ve fotoğraf"],
    after: ["Örn: Kordon Teras", "23:00 DJ performansı"],
  };
  const [baslikEtiket, baslikOrnek, evEtiket, evOrnek] = alanlarFor(answers);
  const istekOrnek = istekOrnekleri(answers);
  const extra = plan.extraKind ? kindOf(plan.extraKind) : null;
  const ozet = plan.toren
    ? `${themeOf(plan.theme).label} renkler, ${ornamentOf(plan.ornament).label.toLocaleLowerCase("tr")} ve ${fontOf(plan.font).label.toLocaleLowerCase("tr")} isimler`
    : `${themeOf(plan.theme).label} renkler, ${ornamentOf(plan.ornament).label.toLocaleLowerCase("tr")} ve ${fontOf(plan.font).label.toLocaleLowerCase("tr")} başlık`;

  return (
    <main className="wrap form-wrap bilgiler">
      <ThemeStyle theme={plan.theme} />
      <div className="brand">
        <Link href="/">Buyrun</Link>
        <Link className="back-link" href={`/basla?${answersQuery(withoutLast(answers))}`}>← Geri</Link>
      </div>
      <div className="bilgiler-onizleme">
        <CanliOnizleme answers={answers} plan={plan} />
      </div>

      <form action={wizardAction} className="card">
        <p className="eyebrow">Son adım</p>
        <h1 className="title">{plan.toren ? "Davetiyeniz hazır, isimleri yazalım" : `${buyukHarf(davetAdi(answers))} hazır, bilgileri yazalım`}</h1>
        <p className="muted">
          Cevaplarınızdan çıkan tasarım: <b>{ozet}</b>. Davet metnini de seçtiğiniz dile göre biz yazacağız;
          beğenmezseniz tek dokunuşla başka öneri alabilirsiniz.
        </p>
        {hata && <p className="err" role="alert">{hata}</p>}

        {/* Cevaplar "c_" önekiyle taşınır: "program" gibi bir cevap adı, aynı adlı metin kutusuyla çakışmasın. */}
        {Object.entries(answers).map(([k, v]) => <input key={k} type="hidden" name={`c_${k}`} value={v} />)}

        {plan.toren ? (
          <>
            <div className="grid2">
              <div><label className="lbl" htmlFor="nameA">Gelin{aday} adı</label><input type="text" id="nameA" name="nameA" required maxLength={40} autoComplete="off" /></div>
              <div><label className="lbl" htmlFor="nameB">Damat{aday} adı</label><input type="text" id="nameB" name="nameB" required maxLength={40} autoComplete="off" /></div>
            </div>
            {plan.families && (
              <>
                <div className="grid2">
                  <div><label className="lbl" htmlFor="familyA">Kız tarafı</label><input type="text" id="familyA" name="familyA" maxLength={60} placeholder="Örn: Ayşe & Ahmet Yılmaz" /></div>
                  <div><label className="lbl" htmlFor="familyB">Erkek tarafı</label><input type="text" id="familyB" name="familyB" maxLength={60} placeholder="Örn: Fatma & Mehmet Kaya" /></div>
                </div>
                <p className="muted small" style={{ marginTop: 6 }}>
                  Anne ve babanın adı, sonra soyadı. Vefat eden için adın başına “Merhum” ya da “Merhume” yazabilirsiniz.
                </p>
              </>
            )}
            <label className="lbl" htmlFor="city">Şehir</label>
            <input type="text" id="city" name="city" maxLength={40} placeholder="Örn: Bursa" />

            <div className="form-section-heading"><span>·</span><h2>{mainTitle}</h2></div>
            <div className="grid2">
              <div><label className="lbl" htmlFor="d_date">Tarih</label><input type="date" id="d_date" name="d_date" required min={todayIso()} /></div>
              <div><label className="lbl" htmlFor="d_time">Saat</label><input type="time" id="d_time" name="d_time" required /></div>
            </div>
            <VenuePicker prefix="d" venueName="d_venue" addressName="d_address" label={answers.torenyer === "kizevi" ? "Yer" : "Salon / yer"} required note
              placeholder={{ kizevi: "Örn: Yılmaz ailesinin evi", restoran: "Örn: Kordon Restoran", bahce: "Örn: Bahçe Davet" }[answers.torenyer ?? ""] ?? "Örn: Podyum Davet"} />

            {extra && (
              <>
                <div className="form-section-heading"><span>·</span><h2>{extra.title}</h2></div>
                <div className="grid2">
                  <div><label className="lbl" htmlFor="k_date">Tarih</label><input type="date" id="k_date" name="k_date" required min={todayIso()} /></div>
                  <div><label className="lbl" htmlFor="k_time">Saat</label><input type="time" id="k_time" name="k_time" required /></div>
                </div>
                <VenuePicker prefix="k" venueName="k_venue" addressName="k_address" label="Yer" required note
                  placeholder={extraOrnek[extra.id]?.[0]} />
              </>
            )}

            {plan.wantsBus && (
              <>
                <div className="form-section-heading"><span>·</span><h2>Servis</h2></div>
                <VenuePicker prefix="bus" venueName="busFrom" label="Kalkış yeri" venueMax={120} placeholder="Örn: Heykel meydanı" />
                <label className="lbl" htmlFor="busTime">Kalkış saati</label>
                <input type="time" id="busTime" name="busTime" style={{ maxWidth: 180 }} />
                <label className="lbl" htmlFor="busNote">Servis notu</label>
                <input type="text" id="busNote" name="busNote" maxLength={160} placeholder="Örn: Dönüş 23:30'da salondan" />
              </>
            )}

            {plan.wantsProgram && (
              <>
                <div className="form-section-heading"><span>·</span><h2>Günün programı</h2></div>
                <label className="lbl" htmlFor="program">{mainTitle} günü</label>
                <textarea id="program" name="program" maxLength={600} rows={6}
                  placeholder={"Her satıra bir madde:\n15:00 Gelin alma\n19:00 " + (plan.extraKind === "nikah" ? "Karşılama" : "Nikâh töreni") + "\n20:00 Yemek\n21:00 İlk dans\n21:30 Takı merasimi\n22:30 Pasta kesimi"} />
                {extra && (
                  <>
                    <label className="lbl" htmlFor="k_program">{extra.title}</label>
                    <textarea id="k_program" name="k_program" maxLength={600} placeholder={extraOrnek[extra.id]?.[1]} />
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <label className="lbl" htmlFor="title">{baslikEtiket}</label>
            <input type="text" id="title" name="title" required maxLength={100} placeholder={`Örn: ${baslikOrnek}`} />
            <label className="lbl" htmlFor="hostName">{evEtiket}</label>
            <input type="text" id="hostName" name="hostName" required maxLength={80} placeholder={`Örn: ${evOrnek}`} />

            <div className="grid2">
              <div><label className="lbl" htmlFor="date">Tarih</label><input type="date" id="date" name="date" required min={todayIso()} /></div>
              <div><label className="lbl" htmlFor="time">Saat</label><input type="time" id="time" name="time" required /></div>
            </div>
            <VenuePicker prefix="" venueName="venue" addressName="address" label="Yer" required note venueMax={160} addressMax={400}
              placeholder="Örn: Moda Teras" />

            <FotoSecici tur={answers.tur} />

            {plan.request === "getir" && (
              <>
                <label className="lbl" htmlFor="request">Ne getirsinler?</label>
                <input type="text" id="request" name="request" maxLength={160} placeholder={istekOrnek[0]} />
              </>
            )}
            {plan.request === "kiyafet" && (
              <>
                <label className="lbl" htmlFor="request">Kıyafet notu</label>
                <input type="text" id="request" name="request" maxLength={160} placeholder={istekOrnek[1]} />
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
