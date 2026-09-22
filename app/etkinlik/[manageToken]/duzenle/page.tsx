import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverPicker } from "@/components/CoverPicker";
import { CATEGORIES } from "@/lib/categories";
import { mobileEventByToken } from "@/lib/mobile";
import { updateEventAction } from "../../actions";

export default async function EtkinlikDuzenle({ params, searchParams }: {
  params: Promise<{ manageToken: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const { manageToken } = await params;
  const { hata } = await searchParams;
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) notFound();
  const kategori = CATEGORIES.includes(row.category as (typeof CATEGORIES)[number]) ? row.category : CATEGORIES[0];

  return (
    <main className="wrap form-wrap">
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

        <label className="lbl" htmlFor="venue">Yer</label>
        <input type="text" id="venue" name="venue" required maxLength={160} defaultValue={row.venue} />
        <label className="lbl" htmlFor="address">Adres</label>
        <input type="text" id="address" name="address" maxLength={400} defaultValue={row.address} />
        <label className="lbl" htmlFor="description">Davetliye not</label>
        <textarea id="description" name="description" maxLength={2000} defaultValue={row.description} />
        <label className="lbl" htmlFor="capacity">Kontenjan (isteğe bağlı)</label>
        <input type="number" id="capacity" name="capacity" min={1} max={10000} inputMode="numeric" defaultValue={row.capacity ?? ""} style={{ width: 140 }} />

        <CoverPicker current={row.cover_id} />

        <div className="btns" style={{ marginTop: 18 }}>
          <button className="btn" type="submit">Değişiklikleri kaydet</button>
          <Link className="btn ghost" href={`/etkinlik/${manageToken}`}>Vazgeç</Link>
        </div>
      </form>
    </main>
  );
}
