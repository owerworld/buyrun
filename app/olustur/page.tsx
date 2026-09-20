import Link from "next/link";
import { ThemePicker } from "@/components/Theme";
import { createAction } from "../actions";

export default async function Olustur({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;
  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link></div>
      <form action={createAction} className="card">
        <h1 className="title">Davetiyeni oluştur</h1>
        {hata && <p className="err" role="alert">{hata}</p>}

        <div className="grid2">
          <div><label className="lbl" htmlFor="nameA">Gelinin adı</label><input type="text" id="nameA" name="nameA" required maxLength={40} /></div>
          <div><label className="lbl" htmlFor="nameB">Damadın adı</label><input type="text" id="nameB" name="nameB" required maxLength={40} /></div>
        </div>
        <label className="lbl" htmlFor="city">Şehir</label>
        <input type="text" id="city" name="city" maxLength={40} placeholder="Örn: Bursa" />

        <ThemePicker />

        <h2 style={{ marginTop: 20 }}>Nikâh ve düğün</h2>
        <div className="grid2">
          <div><label className="lbl" htmlFor="d_date">Tarih</label><input type="date" id="d_date" name="d_date" required /></div>
          <div><label className="lbl" htmlFor="d_time">Saat</label><input type="time" id="d_time" name="d_time" required /></div>
        </div>
        <label className="lbl" htmlFor="d_venue">Salon</label>
        <input type="text" id="d_venue" name="d_venue" required maxLength={80} />
        <label className="lbl" htmlFor="d_address">Adres</label>
        <input type="text" id="d_address" name="d_address" maxLength={120} placeholder="İlçe, şehir" />

        <details style={{ marginTop: 18 }}>
          <summary>Kına gecesi de var</summary>
          <label className="tog" style={{ marginTop: 10 }}><input type="checkbox" name="hasKina" /> Kına gecesini davetiyeye ekle</label>
          <div className="grid2">
            <div><label className="lbl" htmlFor="k_date">Tarih</label><input type="date" id="k_date" name="k_date" /></div>
            <div><label className="lbl" htmlFor="k_time">Saat</label><input type="time" id="k_time" name="k_time" /></div>
          </div>
          <label className="lbl" htmlFor="k_venue">Yer</label>
          <input type="text" id="k_venue" name="k_venue" maxLength={80} placeholder="Örn: Kız evi ya da davet salonu" />
          <label className="lbl" htmlFor="k_address">Adres</label>
          <input type="text" id="k_address" name="k_address" maxLength={120} />
        </details>

        <details style={{ marginTop: 14 }}>
          <summary>Servis ve günün programı</summary>
          <div className="grid2">
            <div><label className="lbl" htmlFor="busFrom">Servis kalkış yeri</label><input type="text" id="busFrom" name="busFrom" maxLength={120} /></div>
            <div><label className="lbl" htmlFor="busTime">Kalkış saati</label><input type="time" id="busTime" name="busTime" /></div>
          </div>
          <label className="lbl" htmlFor="busNote">Servis notu</label>
          <input type="text" id="busNote" name="busNote" maxLength={160} placeholder="Örn: Dönüş 23:30'da salondan" />
          <label className="lbl" htmlFor="program">Düğün günü programı</label>
          <textarea id="program" name="program" maxLength={600} placeholder={"Her satıra bir madde:\n15:00 Gelin alma\n19:00 Nikâh töreni"} />
        </details>

        <label className="tog small" style={{ marginTop: 18 }}>
          <input type="checkbox" name="kvkk" required />
          <span><Link href="/gizlilik" target="_blank">Aydınlatma metnini</Link> okudum. Davetli bilgilerinin son etkinlikten 90 gün sonra silineceğini biliyorum.</span>
        </label>
        <button className="btn full" type="submit" style={{ marginTop: 16 }}>Davetiyeyi oluştur</button>
      </form>
    </main>
  );
}
