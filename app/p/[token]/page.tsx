import Link from "next/link";
import { notFound } from "next/navigation";
import { getPanel, list, SIDE_LABEL, summarize, type Guest, type Invitation } from "@/lib/data";
import { phraseFor, isMainKind } from "@/lib/events";
import { searchFold, siteUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { Workspace } from "@/components/Workspace";
import { AttendanceStats, ResponseChart, EventChart } from "@/components/Attendance";
import { shortDate } from "@/lib/format";
import { addGuestAction, removeGuestAction, updateGuestAction } from "../../actions";

const STATUS = { geliyor: "Geliyor", gelmiyor: "Gelemiyor", bekliyor: "Bekliyor" } as const;

function inviteText(inv: Invitation, g: Guest, kinds: string[]) {
  const nere = phraseFor(kinds.map((kind) => ({ kind })));
  return `Sevgili ${g.name}, ${inv.name_a} ile ${inv.name_b} sizi ${nere} davet ediyor. Katılım durumunuzu buradan bildirebilirsiniz: ${siteUrl()}/d/${g.token}`;
}

export default async function Panel({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ yeni?: string; hata?: string; guncellendi?: string; sifirlandi?: string; durum?: string; ara?: string; bolum?: string }>;
}) {
  const { token } = await params;
  const { yeni, hata, guncellendi, sifirlandi, durum, ara, bolum } = await searchParams;
  const data = await getPanel(token);
  if (!data) notFound();
  const { inv, family, events, guests } = data;
  const mine = guests.filter((g) => g.family_id === family.id);
  const sum = summarize(guests, events);
  const titleOf = (id: string) => events.find((e) => e.id === id)?.title ?? "";
  const kindsOf = (g: Guest) => list(g.event_ids).map((i) => events.find((e) => e.id === i)?.kind ?? "");
  const waiting = mine.filter((g) => g.status === "bekliyor");
  const sayilar = {
    "": mine.length,
    bekliyor: waiting.length,
    geliyor: mine.filter((g) => g.status === "geliyor").length,
    gelmiyor: mine.filter((g) => g.status === "gelmiyor").length,
  };
  const suzgec = durum && durum in STATUS ? durum : "";
  const arama = (ara ?? "").trim();
  const aranan = searchFold(arama);
  const gosterilen = mine
    .filter((g) => (suzgec ? g.status === suzgec : true))
    .filter((g) => (aranan ? searchFold(g.name).includes(aranan) : true));
  const FILTRELER: [string, string][] = [["", "Tümü"], ["bekliyor", "Bekleyen"], ["geliyor", "Geliyor"], ["gelmiyor", "Gelemiyor"]];
  /** Süzgeç ve arama birbirini sıfırlamasın diye linkler ikisini de taşır. */
  const panelUrl = (d: string, a: string) => {
    const q = new URLSearchParams();
    if (d) q.set("durum", d);
    if (a) q.set("ara", a);
    return `/p/${token}${q.size ? `?${q}` : ""}`;
  };
  // Kısa listede arama kutusu gereksiz yer kaplar
  const aramaGoster = mine.length >= 8 || Boolean(arama);
  const fresh = yeni ? mine.find((g) => g.token === yeni) : undefined;
  const add = addGuestAction.bind(null, token);
  const active = bolum === "ekle" || bolum === "sayim" ? bolum : "liste";
  const root = `/p/${token}`;

  return (
    <Workspace title={`${SIDE_LABEL[family.side]} paneli`} subtitle={`${inv.name_a} ile ${inv.name_b} · ${shortDate(inv.main_date)}`} label="Ailenin davetli alanı"
      nav={[{label:"Davetliler", href:root, active:active === "liste", icon:"people"}, {label:"Davetli ekle", href:`${root}?bolum=ekle`, active:active === "ekle", icon:"add"}, {label:"Ortak sayım", href:`${root}?bolum=sayim`, active:active === "sayim", icon:"overview"}]}
      action={active !== "ekle" ? <Link className="btn" href={`${root}?bolum=ekle`}>+ Davetli ekle</Link> : undefined}>
      {hata && <p className="err" role="alert">{hata}</p>}

      {fresh && active === "liste" && (
        <section className="surface fresh-guest" role="status">
          <h2>{fresh.name} eklendi</h2>
          <p className="muted small">Kişiye özel link hazır. Mesajı kendi WhatsApp'ınızdan gönderin.</p>
          <div className="linkbox">{inviteText(inv, fresh, kindsOf(fresh))}</div>
          <div className="btns">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(inviteText(inv, fresh, kindsOf(fresh)))}`} target="_blank" rel="noopener noreferrer">WhatsApp'ta aç</a>
            <Link className="btn ghost" href={`${root}?bolum=ekle`}>Bir davetli daha ekle</Link>
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

      {active === "sayim" && <>
        <div className="page-section-title"><h2>İki aile, ortak katılım</h2><p className="muted">Salon için gereken toplamı burada görün. Diğer ailenin davetli bilgileri gizlidir.</p></div>
        <AttendanceStats summary={sum} />
        <div className="family-grid"><ResponseChart summary={sum} /><EventChart summary={sum} /></div>
      </>}

      {active === "liste" && <section className="surface guest-surface">
        <div className="section-heading"><h2>Davetlileriniz</h2><span className="subtle-badge">{mine.length} davet</span></div>
        <p className="muted small">Bu listede yalnızca ailenizin eklediği davetliler görünür.</p>
        {mine.length === 0 && <div className="empty-state"><span className="empty-symbol" aria-hidden="true">♡</span><h3>İlk davetle başlayın.</h3><p className="muted">Bir kişinin ya da ailenin adını yazın; kişiye özel mesajını hazırlayalım.</p><Link className="btn" href={`${root}?bolum=ekle`}>İlk davetliyi ekle</Link></div>}
        {mine.length > 0 && (
          <nav className="filtre" aria-label="Davetlileri duruma göre süz">
            {FILTRELER.map(([deger, etiket]) => (
              <Link
                key={deger || "tumu"}
                href={panelUrl(deger, arama)}
                aria-current={suzgec === deger ? "page" : undefined}
                className={suzgec === deger ? "secili" : undefined}
              >
                {etiket} ({sayilar[(deger || "") as keyof typeof sayilar]})
              </Link>
            ))}
          </nav>
        )}
        {aramaGoster && (
          <form className="ara" method="get" action={`/p/${token}`}>
            {suzgec && <input type="hidden" name="durum" value={suzgec} />}
            <label className="sr-only" htmlFor="ara">Davetli ara</label>
            <input type="search" id="ara" name="ara" defaultValue={arama} maxLength={60} placeholder="İsimle ara" />
            <button className="btn sm" type="submit">Ara</button>
          </form>
        )}
        {arama && (
          <p className="muted small" style={{ marginTop: 8 }} aria-live="polite">
            “{arama}” için {gosterilen.length} sonuç. <Link href={panelUrl(suzgec, "")}>Aramayı temizle</Link>
          </p>
        )}
        {mine.length > 0 && gosterilen.length === 0 && !arama && (
          <p className="muted" style={{ marginTop: 12 }}>Bu durumda davetli yok.</p>
        )}
        <div>
          {gosterilen.map((g) => (
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
                <a className="lnk" href={`https://wa.me/?text=${encodeURIComponent(inviteText(inv, g, kindsOf(g)))}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <CopyButton text={inviteText(inv, g, kindsOf(g))} label="Mesajı kopyala" />
              </div>
              <details style={{ gridColumn: "1/-1" }}>
                <summary className="lnk">Düzenle</summary>
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
                <form action={removeGuestAction.bind(null, token, g.id)} style={{ marginTop: 10 }}>
                  <label className="tog small"><input type="checkbox" name="silOnay" required />Bu davetlinin ve yanıtının silinmesini onaylıyorum.</label>
                  <button className="lnk" type="submit" style={{ color: "var(--no)" }}>Bu davetliyi sil</button>
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
              text={waiting.map((g) => `${g.name}: Merhaba, davetimize katılım durumunuzu bildirebilir misiniz? ${siteUrl()}/d/${g.token}`).join("\n\n")}
              label={`Yanıt bekleyen ${waiting.length} davet için hatırlatma metnini kopyala`}
            />
          </div>
        )}
      </section>}

      {active === "ekle" && <div className="add-guest-layout"><form action={add} className="surface" id="ekle">
        <h2>Davetli ekle</h2>
        <label className="lbl" htmlFor="name">Ad soyad ya da aile</label>
        <input type="text" id="name" name="name" required maxLength={60} placeholder="Örn: Fatma Teyze ve ailesi" />
        <span className="lbl">Davetli olduğu günler</span>
        <div className="evpick">
          {events.map((e) => <label key={e.id} className="tog"><input type="checkbox" name="ev" value={e.id} defaultChecked={isMainKind(e.kind) || family.side === "kiz"} /> {e.title}</label>)}
        </div>
        <button className="btn full" type="submit" style={{ marginTop: 10 }}>Ekle ve mesajı hazırla</button>
        <div className="info">Telefon numarası istemiyoruz. Davetiyeyi kendi WhatsApp'ınızdan gönderirsiniz. Misafir listesi son etkinlikten 90 gün sonra otomatik silinir. Bu panelin linkini sadece aile içinde paylaşın.</div>
      </form><aside className="surface add-guest-help"><p className="eyebrow">Üç küçük adım</p><ol><li><b>Bir isim yazın.</b><span>Tek kişi veya bütün aile için bir davet oluşturun.</span></li><li><b>Günleri seçin.</b><span>Davetliniz sadece çağrıldığı etkinlikleri görür.</span></li><li><b>Mesajı paylaşın.</b><span>Hazırlanan mesajı kendi WhatsApp'ınızdan gönderin.</span></li></ol><p className="chart-note">Telefon numarası veya üyelik gerekmez.</p></aside></div>}
    </Workspace>
  );
}
