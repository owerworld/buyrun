import Link from "next/link";
import { notFound } from "next/navigation";
import { getPanel, list, SIDE_LABEL, summarize, type Guest, type Invitation } from "@/lib/data";
import { phraseFor } from "@/lib/events";
import { siteUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { addGuestAction, removeGuestAction, updateGuestAction } from "../../actions";

const STATUS = { geliyor: "Geliyor", gelmiyor: "Gelemiyor", bekliyor: "Bekliyor" } as const;

function inviteText(inv: Invitation, g: Guest, kinds: string[]) {
  const nere = phraseFor(kinds.map((kind) => ({ kind })));
  return `Sevgili ${g.name}, ${inv.name_a} ile ${inv.name_b} sizi ${nere} davet ediyor. Katılım durumunuzu buradan bildirebilirsiniz: ${siteUrl()}/d/${g.token}`;
}

export default async function Panel({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ yeni?: string; hata?: string; guncellendi?: string; sifirlandi?: string }>;
}) {
  const { token } = await params;
  const { yeni, hata, guncellendi, sifirlandi } = await searchParams;
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

      {(guncellendi || sifirlandi) && (
        <p className="info" role="status" style={{ marginTop: 0 }}>
          {sifirlandi
            ? "Davetli güncellendi. Geliyorum dediği gün artık davetinde olmadığı için yanıtı beklemeye alındı, kendisine tekrar sorabilirsiniz."
            : "Davetli güncellendi. Linki ve verdiği yanıt aynen duruyor."}
        </p>
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
              <details style={{ gridColumn: "1/-1" }}>
                <summary className="lnk">Adını ve günlerini değiştir</summary>
                <form action={updateGuestAction.bind(null, token, g.id)}>
                  <label className="lbl" htmlFor={`ad_${g.id}`}>Ad soyad ya da aile</label>
                  <input type="text" id={`ad_${g.id}`} name="name" required maxLength={60} defaultValue={g.name} />
                  {events.length > 1 && (
                    <>
                      <span className="lbl">Davetli olduğu günler</span>
                      <div className="evpick">
                        {events.map((e) => (
                          <label className="tog" key={e.id}>
                            <input type="checkbox" name="ev" value={e.id} defaultChecked={list(g.event_ids).includes(e.id)} /> {e.title}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {events.length === 1 && <input type="hidden" name="ev" value={events[0].id} />}
                  <button className="btn sm" type="submit" style={{ marginTop: 6 }}>Kaydet</button>
                </form>
              </details>
            </div>
          ))}
        </div>
        {mine.length > 0 && (
          <p style={{ marginTop: 12 }}>
            <a className="btn ghost full" href={`/p/${token}/liste`} download>Listeyi indir (Excel)</a>
          </p>
        )}
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
