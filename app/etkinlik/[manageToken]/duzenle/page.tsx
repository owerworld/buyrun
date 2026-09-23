import Link from "next/link";
import { VenuePicker } from "@/components/VenuePicker";
import { notFound } from "next/navigation";
import { CoverPicker } from "@/components/CoverPicker";
import { CATEGORIES } from "@/lib/categories";
import { designOf, mobileEventByToken } from "@/lib/mobile";
import { ThemePicker, ThemeStyle } from "@/components/Theme";
import { FontPicker, OrnamentPicker, PatternPicker } from "@/components/DesignPickers";
import { updateEventAction } from "../../actions";

export default async function EtkinlikDuzenle({ params, searchParams }: {
  params: Promise<{ manageToken: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const { manageToken } = await params;
  const { hata } = await searchParams;
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) notFound();
  const design = designOf(row);
  const kategori = CATEGORIES.includes(row.category as (typeof CATEGORIES)[number]) ? row.category : CATEGORIES[0];

  return (
    <main className="wrap form-wrap">
      {design && <ThemeStyle theme={design.theme} />}
      <div className="brand"><Link href="/">Buyrun</Link><span className="muted small">Düzenle</span></div>
      <form action={updateEventAction.bind(null, manageToken)} className="card">
        <h1 className="title">Etkinliği düzenle</h1>
        <p className="muted small" style={{ marginTop: -4 }}>
          Değişiklikler davet linkinde anında görünür. Gönderdiğiniz linkler geçerli kalır.
        </p>
        {hata && <p className="err" role="alert">{hata}</p>}

        <label className="lbl" htmlFor="title">Etkinliğin adı</label>
        <input type="text" id="title" name="title" required maxLength={100} defaultValue={row.title} />

        <fieldset style={{ marginTop: 14 }}>
          <legend className="lbl" style={{ margin: 0 }}>Ne tür bir etkinlik?</legend>
          <div className="secenekler dort">
            {CATEGORIES.map((c) => (
              <label key={c}>
                <input type="radio" name="category" value={c} defaultChecked={c === kategori} />
                <span className="secenek">{c}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="lbl" htmlFor="hostName">Ev sahibi</label>
        <input type="text" id="hostName" name="hostName" required maxLength={80} defaultValue={row.host_name} />

        <div className="grid2">
          <div><label className="lbl" htmlFor="date">Tarih</label><input type="date" id="date" name="date" required defaultValue={row.event_date} /></div>
          <div><label className="lbl" htmlFor="time">Saat</label><input type="time" id="time" name="time" required defaultValue={row.event_time} /></div>
        </div>
        <VenuePicker prefix="" venueName="venue" addressName="address" label="Yer" required note venueMax={160} addressMax={400}
          placeholder="Örn: Moda Teras" defaultVenue={row.venue} defaultAddress={row.address} defaultLat={row.lat} defaultLng={row.lng} defaultPlaceId={row.place_id} defaultNote={row.directions} />
        <label className="lbl" htmlFor="description">Davetliye not</label>
        <textarea id="description" name="description" maxLength={2000} defaultValue={row.description} />
        <label className="lbl" htmlFor="capacity">Kontenjan (isteğe bağlı)</label>
        <input type="number" id="capacity" name="capacity" min={1} max={10000} inputMode="numeric" defaultValue={row.capacity ?? ""} style={{ width: 140 }} />

        {design ? (
          <>
            {/* Uygulama fotoğraflı kapağı göstermeye devam eder; web daveti bu tasarımı */}
            <input type="hidden" name="coverId" value={row.cover_id} />
            <div className="form-section-heading"><span>✦</span><h2>Görünüm</h2></div>
            <ThemePicker current={design.theme} />
            <FontPicker current={design.font} names={row.title} />
            <OrnamentPicker current={design.ornament} />
            <PatternPicker current={design.pattern} />
          </>
        ) : (
          <CoverPicker current={row.cover_id} />
        )}

        <div className="btns" style={{ marginTop: 18 }}>
          <button className="btn" type="submit">Değişiklikleri kaydet</button>
          <Link className="btn ghost" href={`/etkinlik/${manageToken}`}>Vazgeç</Link>
        </div>
      </form>
    </main>
  );
}
