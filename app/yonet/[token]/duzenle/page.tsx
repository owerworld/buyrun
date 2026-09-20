import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { ThemePicker } from "@/components/Theme";
import { updateInvitationAction } from "../../../actions";

/** Çift davetiyesini oluşturduktan sonra buradan düzeltir. Davetli linkleri değişmez. */
export default async function Duzenle({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const { token } = await params;
  const { hata } = await searchParams;
  const data = await getAdmin(token);
  if (!data) notFound();
  const { inv, events } = data;
  const save = updateInvitationAction.bind(null, token);

  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link><span className="muted small">Düzenle</span></div>
      <form action={save} className="card">
        <h1 className="title">Davetiyeyi düzenle</h1>
        <p className="muted small" style={{ marginTop: -4 }}>
          Değişiklikler davetlilerin linklerinde anında görünür. Gönderdiğiniz linkler geçerli kalır.
        </p>
        {hata && <p className="err" role="alert">{hata}</p>}

        <div className="grid2">
          <div><label className="lbl" htmlFor="nameA">Gelinin adı</label><input type="text" id="nameA" name="nameA" required maxLength={40} defaultValue={inv.name_a} /></div>
          <div><label className="lbl" htmlFor="nameB">Damadın adı</label><input type="text" id="nameB" name="nameB" required maxLength={40} defaultValue={inv.name_b} /></div>
        </div>
        <label className="lbl" htmlFor="city">Şehir</label>
        <input type="text" id="city" name="city" maxLength={40} placeholder="Örn: Bursa" defaultValue={inv.city} />

        <ThemePicker current={inv.theme} />

        {events.map((e) => (
          <div key={e.id}>
            <h2 style={{ marginTop: 20 }}>{e.title}</h2>
            <div className="grid2">
              <div>
                <label className="lbl" htmlFor={`e_${e.id}_date`}>Tarih</label>
                <input type="date" id={`e_${e.id}_date`} name={`e_${e.id}_date`} required defaultValue={e.event_date} />
              </div>
              <div>
                <label className="lbl" htmlFor={`e_${e.id}_time`}>Saat</label>
                <input type="time" id={`e_${e.id}_time`} name={`e_${e.id}_time`} required defaultValue={e.event_time} />
              </div>
            </div>
            <label className="lbl" htmlFor={`e_${e.id}_venue`}>{e.kind === "kina" ? "Yer" : "Salon"}</label>
            <input type="text" id={`e_${e.id}_venue`} name={`e_${e.id}_venue`} required maxLength={80} defaultValue={e.venue} />
            <label className="lbl" htmlFor={`e_${e.id}_address`}>Adres</label>
            <input type="text" id={`e_${e.id}_address`} name={`e_${e.id}_address`} maxLength={120} placeholder="İlçe, şehir" defaultValue={e.address} />
          </div>
        ))}

        <h2 style={{ marginTop: 20 }}>Servis ve program</h2>
        <div className="grid2">
          <div><label className="lbl" htmlFor="busFrom">Servis kalkış yeri</label><input type="text" id="busFrom" name="busFrom" maxLength={120} defaultValue={inv.bus_from} /></div>
          <div><label className="lbl" htmlFor="busTime">Kalkış saati</label><input type="time" id="busTime" name="busTime" defaultValue={inv.bus_time} /></div>
        </div>
        <label className="lbl" htmlFor="busNote">Servis notu</label>
        <input type="text" id="busNote" name="busNote" maxLength={160} placeholder="Örn: Dönüş 23:30'da salondan" defaultValue={inv.bus_note} />
        <label className="lbl" htmlFor="program">Düğün günü programı</label>
        <textarea id="program" name="program" maxLength={600} placeholder={"Her satıra bir madde:\n15:00 Gelin alma\n19:00 Nikâh töreni"} defaultValue={inv.program} />

        <div className="btns" style={{ marginTop: 18 }}>
          <button className="btn" type="submit">Değişiklikleri kaydet</button>
          <Link className="btn ghost" href={`/yonet/${token}`}>Vazgeç</Link>
        </div>
        <p className="info">
          Kına gecesini sonradan eklemek ya da kaldırmak bu ekranda yok — davetlilerin hangi güne çağrıldığı
          buna bağlı olduğu için ayrı ele alınması gerekiyor.
        </p>
      </form>
    </main>
  );
}
