import Link from "next/link";
import { VenuePicker } from "@/components/VenuePicker";
import { CoverPicker } from "@/components/CoverPicker";
import { CATEGORIES } from "@/lib/categories";
import { createEventAction } from "./actions";

export const metadata = { title: "Etkinlik oluştur – Buyrun" };

/** Düğün dışındaki her şey: doğum günü, ev partisi, mezuniyet, kulüp etkinliği… */
export default async function Etkinlik({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;
  return (
    <main className="wrap form-wrap">
      <div className="brand"><Link href="/">Buyrun</Link><span className="muted small">Etkinlik</span></div>
      <form action={createEventAction} className="card">
        <h1 className="title">Etkinliğini oluştur</h1>
        <p className="muted">
          Doğum günü, ev partisi, mezuniyet, kulüp etkinliği… Davetliler uygulama indirmeden yanıt verir.
        </p>
        {hata && <p className="err" role="alert">{hata}</p>}

        <label className="lbl" htmlFor="title">Etkinliğin adı</label>
        <input type="text" id="title" name="title" required maxLength={100} placeholder="Örn: İyi ki doğdun, Ece!" />

        <fieldset style={{ marginTop: 14 }}>
          <legend className="lbl" style={{ margin: 0 }}>Ne tür bir etkinlik?</legend>
          <div className="secenekler dort">
            {CATEGORIES.map((c, i) => (
              <label key={c}>
                <input type="radio" name="category" value={c} defaultChecked={i === 0} />
                <span className="secenek">{c}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="lbl" htmlFor="hostName">Ev sahibi</label>
        <input type="text" id="hostName" name="hostName" required maxLength={80} placeholder="Örn: Ece ya da Bilgisayar Kulübü" />

        <div className="grid2">
          <div><label className="lbl" htmlFor="date">Tarih</label><input type="date" id="date" name="date" required /></div>
          <div><label className="lbl" htmlFor="time">Saat</label><input type="time" id="time" name="time" required /></div>
        </div>
        <VenuePicker prefix="" venueName="venue" addressName="address" label="Yer" required note venueMax={160} addressMax={400}
          placeholder="Örn: Moda Teras" />

        <label className="lbl" htmlFor="description">Davetliye not</label>
        <textarea id="description" name="description" maxLength={2000} placeholder="Örn: Kek bende, sen sadece gel. Otopark binanın altında." />

        <label className="lbl" htmlFor="capacity">Kontenjan (isteğe bağlı)</label>
        <input type="number" id="capacity" name="capacity" min={1} max={10000} inputMode="numeric" placeholder="Örn: 40" style={{ width: 140 }} />

        <CoverPicker />

        <label className="tog small" style={{ marginTop: 18 }}>
          <input type="checkbox" name="kvkk" required />
          <span><Link href="/gizlilik" target="_blank">Aydınlatma metnini</Link> okudum. Davetli bilgilerinin etkinlikten 90 gün sonra silineceğini biliyorum.</span>
        </label>
        <button className="btn full" type="submit" style={{ marginTop: 16 }}>Etkinliği oluştur</button>
        <div className="info">
          Telefon numarası istemiyoruz, para toplamıyoruz. Düğün mü yapıyorsunuz?{" "}
          <Link href="/olustur">İki aile panelli düğün davetiyesi</Link> daha uygun olur.
        </div>
      </form>
    </main>
  );
}
