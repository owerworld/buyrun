import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin, kinaOnlyGuests } from "@/lib/data";
import { ThemePicker } from "@/components/Theme";
import { addKinaAction, removeKinaAction, updateInvitationAction } from "../../../actions";

/** Çift davetiyesini oluşturduktan sonra buradan düzeltir. Davetli linkleri değişmez. */
export default async function Duzenle({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const { token } = await params;
  const { hata } = await searchParams;
  const data = await getAdmin(token);
  if (!data) notFound();
  const { inv, events, guests } = data;
  const save = updateInvitationAction.bind(null, token);
  const kina = events.find((e) => e.kind === "kina");
  const yalnizKina = kina ? kinaOnlyGuests(guests, kina.id).length : 0;

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
      </form>

      {kina ? (
        <form action={removeKinaAction.bind(null, token)} className="card" id="kina">
          <h2>Kına gecesini kaldır</h2>
          <p className="muted small">
            Kına gecesi davetiyeden çıkar, davetlilerin bu gün için verdiği yanıtlar silinir.
            Düğün bilgileri ve davetli linkleri etkilenmez.
          </p>
          {yalnizKina > 0 ? (
            <p className="err">
              {yalnizKina} davetli yalnızca kına gecesine çağrılmış. Kınayı kaldırırsanız ellerinde boş bir
              davetiye kalır. Önce ailelerin bu kişileri kendi panellerinden silmesi gerekiyor.
            </p>
          ) : (
            <>
              <label className="tog small" style={{ marginTop: 10 }}>
                <input type="checkbox" name="onay" />
                <span>Kına gecesini kaldırmak istediğimi onaylıyorum.</span>
              </label>
              <button className="btn danger full" type="submit" style={{ marginTop: 12 }}>
                Kına gecesini kaldır
              </button>
            </>
          )}
        </form>
      ) : (
        <form action={addKinaAction.bind(null, token)} className="card" id="kina">
          <h2>Kına gecesi ekle</h2>
          <p className="muted small">Davetiyede şu an sadece düğün var. Kına gecesini şimdi ekleyebilirsiniz.</p>
          <div className="grid2">
            <div><label className="lbl" htmlFor="k_date">Tarih</label><input type="date" id="k_date" name="k_date" required /></div>
            <div><label className="lbl" htmlFor="k_time">Saat</label><input type="time" id="k_time" name="k_time" required /></div>
          </div>
          <label className="lbl" htmlFor="k_venue">Yer</label>
          <input type="text" id="k_venue" name="k_venue" required maxLength={80} placeholder="Örn: Kız evi ya da davet salonu" />
          <label className="lbl" htmlFor="k_address">Adres</label>
          <input type="text" id="k_address" name="k_address" maxLength={120} placeholder="İlçe, şehir" />
          <label className="tog small" style={{ marginTop: 12 }}>
            <input type="checkbox" name="mevcut" defaultChecked />
            <span>Şu ana kadar eklenmiş {guests.length} davetli kınaya da çağrılsın.</span>
          </label>
          <button className="btn full" type="submit" style={{ marginTop: 12 }}>Kına gecesini ekle</button>
        </form>
      )}
    </main>
  );
}
