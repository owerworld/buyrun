import Link from "next/link";
import { notFound } from "next/navigation";
import { getPanel, list, SIDE_LABEL, summarize, type Guest, type Invitation } from "@/lib/data";
import { siteUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { addGuestAction, removeGuestAction } from "../../actions";

const STATUS = { geliyor: "Geliyor", gelmiyor: "Gelemiyor", bekliyor: "Bekliyor" } as const;

function phrase(kinds: string[]) {
  const k = kinds.includes("kina"), d = kinds.includes("dugun");
  return k && d ? "kına gecelerine ve düğünlerine" : k ? "kına gecelerine" : "düğünlerine";
}
function inviteText(inv: Invitation, g: Guest, kinds: string[]) {
  return `Sevgili ${g.name}, ${inv.name_a} ile ${inv.name_b} sizi ${phrase(kinds)} davet ediyor. Katılım durumunuzu buradan bildirebilirsiniz: ${siteUrl()}/d/${g.token}`;
}

export default async function Panel({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ yeni?: string; hata?: string }> }) {
  const { token } = await params;
  const { yeni, hata } = await searchParams;
  const data = await getPanel(token);
  if (!data) notFound();
  const { inv, family, events, guests } = data;
  const mine = guests.filter((g) => g.family_id === family.id);
  const sum = summarize(guests, events);
  const titleOf = (id: string) => events.find((e) => e.id === id)?.title ?? "";
  const kindsOf = (g: Guest) => list(g.event_ids).map((i) => events.find((e) => e.id === i)?.kind ?? "");
  const waiting = mine.filter((g) => g.status === "bekliyor");
  const fresh = yeni ? mine.find((g) => g.token === yeni) : undefined;
  const add = addGuestAction.bind(null, token);

  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link><span className="muted small">{inv.name_a} ile {inv.name_b}</span></div>

      {fresh && (
        <section className="card" role="status">
          <h2>{fresh.name} eklendi</h2>
          <p className="muted small">Kişiye özel link hazır. Mesajı kendi WhatsApp'ınızdan gönderin.</p>
          <div className="linkbox">{inviteText(inv, fresh, kindsOf(fresh))}</div>
          <div className="btns">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(inviteText(inv, fresh, kindsOf(fresh)))}`} target="_blank" rel="noopener noreferrer">WhatsApp'ta aç</a>
            <Link className="btn ghost" href={`/p/${token}`}>Tamam</Link>
          </div>
        </section>
      )}

      <section className="card">
        <h1 className="title">{SIDE_LABEL[family.side]} paneli</h1>
        <p className="muted small">Kendi davetlilerinizi yönetirsiniz. Salon için gereken toplam, iki ailenin yanıtlarını birleştirir.</p>
        <h3 style={{ marginBottom: 8 }}>Ortak sayım (iki aile)</h3>
        <div className="stats">
          <div className="stat"><b>{sum.people}</b><span>Gelecek kişi</span></div>
          <div className="stat"><b>{sum.waiting}</b><span>Yanıt bekleyen davet</span></div>
          <div className="stat"><b>{sum.comingInvites}</b><span>Geliyorum diyen davet</span></div>
          <div className="stat"><b>{sum.declined}</b><span>Gelemiyorum diyen</span></div>
        </div>
        <div className="heads">{sum.perEvent.map((e) => <div key={e.id} className={`head ${e.kind}`}>{e.title}<br /><b>{e.people}</b> kişi</div>)}</div>
      </section>

      <section className="card">
        <h2>{SIDE_LABEL[family.side]} davetlileri ({mine.length})</h2>
        {mine.length === 0 && <p className="muted">Henüz davetli yok. Aşağıdan ilk davetliyi ekleyin.</p>}
        <div>
          {mine.map((g) => (
            <div className="guest" key={g.id}>
              <div>
                <div className="n">{g.name}</div>
                <div className="tags">
                  {list(g.event_ids).map((i) => <span key={i} className="tag">{titleOf(i)}</span>)}
                  {g.status === "geliyor" && <span className="tag">{g.count} kişi</span>}
                </div>
                {g.note && <div className="muted small" style={{ marginTop: 4 }}>“{g.note}”</div>}
              </div>
              <span className={`pill ${g.status}`}>{STATUS[g.status]}</span>
              <div className="act">
                <CopyButton text={inviteText(inv, g, kindsOf(g))} label="Davet mesajını kopyala" />
                <a className="lnk" href={`https://wa.me/?text=${encodeURIComponent(inviteText(inv, g, kindsOf(g)))}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <form action={removeGuestAction.bind(null, token, g.id)}><button className="lnk" type="submit" style={{ color: "var(--no)" }}>Sil</button></form>
              </div>
            </div>
          ))}
        </div>
        {waiting.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <CopyButton
              text={waiting.map((g) => `${g.name}: Merhaba, düğünümüze katılım durumunuzu bildirebilir misiniz? ${siteUrl()}/d/${g.token}`).join("\n\n")}
              label={`Yanıt bekleyen ${waiting.length} kişi için hatırlatma metnini kopyala`}
            />
          </div>
        )}
      </section>

      <form action={add} className="card" id="ekle">
        <h2>Davetli ekle</h2>
        {hata && <p className="err" role="alert">{hata}</p>}
        <label className="lbl" htmlFor="name">Ad soyad ya da aile</label>
        <input type="text" id="name" name="name" required maxLength={60} placeholder="Örn: Fatma Teyze ve ailesi" />
        <span className="lbl">Davetli olduğu günler</span>
        <div className="evpick">
          {events.map((e) => <label key={e.id} className="tog"><input type="checkbox" name="ev" value={e.id} defaultChecked={e.kind === "dugun" || family.side === "kiz"} /> {e.title}</label>)}
        </div>
        <button className="btn full" type="submit" style={{ marginTop: 10 }}>Ekle ve mesajı hazırla</button>
        <div className="info">Telefon numarası istemiyoruz. Davetiyeyi kendi WhatsApp'ınızdan gönderirsiniz. Misafir listesi son etkinlikten 90 gün sonra otomatik silinir. Bu panelin linkini sadece aile içinde paylaşın.</div>
      </form>
    </main>
  );
}
