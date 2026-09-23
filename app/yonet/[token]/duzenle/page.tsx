import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin, onlyGuestsOf } from "@/lib/data";
import { EXTRA_KINDS, extraOf, isExtraKind } from "@/lib/events";
import { KindPicker } from "@/components/KindPicker";
import { ThemePicker } from "@/components/Theme";
import { FontPicker, OrnamentPicker } from "@/components/DesignPickers";
import { addExtraEventAction, removeExtraEventAction, updateInvitationAction } from "../../../actions";

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
  const extra = extraOf(events);
  const yalnizExtra = extra ? onlyGuestsOf(guests, extra.id).length : 0;

  return (
    <main className="wrap form-wrap">
      <div className="brand"><Link href="/">Buyrun</Link><Link className="back-link" href={`/yonet/${token}?bolum=davetiye`}>← Davetiyeye dön</Link></div>
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

        <label className="lbl" htmlFor="message">Davet metni</label>
        <textarea id="message" name="message" maxLength={600} rows={3} defaultValue={inv.message ?? ""}
          placeholder="Davetiyede isimlerinizin altında görünen cümle. Boş bırakırsanız hazır metin kullanılır." />
        <p className="muted small" style={{ marginTop: 6 }}>Sihirbaz sizin için yazdı; dilediğiniz gibi değiştirin.</p>

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
            <label className="lbl" htmlFor={`e_${e.id}_venue`}>{isExtraKind(e.kind) ? "Yer" : "Salon / yer"}</label>
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
        <label className="lbl" htmlFor="program">Tören günü programı</label>
        <textarea id="program" name="program" maxLength={600} placeholder={"Her satıra bir madde:\n15:00 Gelin alma\n19:00 Nikâh töreni"} defaultValue={inv.program} />
        {extra && (
          <>
            <label className="lbl" htmlFor="k_program">{extra.title} programı</label>
            <textarea id="k_program" name="k_program" maxLength={600} placeholder={"Her satıra bir madde:\n20:00 Karşılama\n21:30 Kına yakma"} defaultValue={inv.extra_program} />
          </>
        )}

        <div className="form-section-heading"><span>✦</span><h2>Görünüm</h2></div>
        <ThemePicker current={inv.theme} />
        <FontPicker current={inv.font} names={`${inv.name_a} & ${inv.name_b}`} />
        <OrnamentPicker current={inv.ornament} />
        <div className="btns" style={{ marginTop: 18 }}>
          <button className="btn" type="submit">Değişiklikleri kaydet</button>
          <Link className="btn ghost" href={`/yonet/${token}`}>Vazgeç</Link>
        </div>
      </form>

      {extra ? (
        <form action={removeExtraEventAction.bind(null, token)} className="card" id="etkinlik">
          <h2>{extra.title} etkinliğini kaldır</h2>
          <p className="muted small">
            Bu gün davetiyeden çıkar, davetlilerin yalnızca bu gün için verdiği yanıtlar silinir.
            Ana tören bilgileri ve davetli linkleri etkilenmez.
          </p>
          {yalnizExtra > 0 ? (
            <p className="err">
              {yalnizExtra} davetli yalnızca bu güne çağrılmış. Kaldırırsanız ellerinde boş bir davetiye
              kalır. Önce ailelerin bu kişileri kendi panellerinden silmesi gerekiyor.
            </p>
          ) : (
            <>
              <label className="tog small" style={{ marginTop: 10 }}>
                <input type="checkbox" name="onay" />
                <span>{extra.title} etkinliğini kaldırmak istediğimi onaylıyorum.</span>
              </label>
              <button className="btn danger full" type="submit" style={{ marginTop: 12 }}>
                {extra.title} etkinliğini kaldır
              </button>
            </>
          )}
        </form>
      ) : (
        <form action={addExtraEventAction.bind(null, token)} className="card" id="etkinlik">
          <h2>İkinci etkinlik ekle</h2>
          <p className="muted small">Davetiyede şu an tek gün var. Kına gecesi ya da after party ekleyebilirsiniz.</p>
          <KindPicker name="k_tur" kinds={EXTRA_KINDS} legend="Etkinlik türü" />
          <div className="grid2">
            <div><label className="lbl" htmlFor="k_date">Tarih</label><input type="date" id="k_date" name="k_date" required /></div>
            <div><label className="lbl" htmlFor="k_time">Saat</label><input type="time" id="k_time" name="k_time" required /></div>
          </div>
          <label className="lbl" htmlFor="k_venue">Yer</label>
          <input type="text" id="k_venue" name="k_venue" required maxLength={80} placeholder="Örn: Kız evi ya da davet salonu" />
          <label className="lbl" htmlFor="k_address">Adres</label>
          <input type="text" id="k_address" name="k_address" maxLength={120} placeholder="İlçe, şehir" />
          <label className="lbl" htmlFor="k_program">Bu günün programı (isteğe bağlı)</label>
          <textarea id="k_program" name="k_program" maxLength={600} placeholder={"Her satıra bir madde:\n20:00 Karşılama\n21:30 Kına yakma"} />
          <label className="tog small" style={{ marginTop: 12 }}>
            <input type="checkbox" name="mevcut" defaultChecked />
            <span>Şu ana kadar eklenmiş {guests.length} davetli bu güne de çağrılsın.</span>
          </label>
          <button className="btn full" type="submit" style={{ marginTop: 12 }}>Etkinliği ekle</button>
        </form>
      )}
    </main>
  );
}
