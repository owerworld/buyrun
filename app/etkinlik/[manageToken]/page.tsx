import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { Workspace } from "@/components/Workspace";
import { longDate } from "@/lib/format";
import { EventHero } from "@/components/EventHero";
import { themeScope } from "@/components/Theme";
import { designOf, managedEvent, mobileEventByToken, mobileSummary, MOBILE_STATUS_LABEL, type MobileStatus } from "@/lib/mobile";
import { siteUrl } from "@/lib/format";
import { addEventGuestAction, removeEventGuestAction, setEventGuestAction } from "../actions";

const DURUMLAR: MobileStatus[] = ["going", "maybe", "declined", "pending"];
/** Renk sınıfları düğün tarafındakilerle aynı; "belki" bekleyen tonunu kullanır. */
const PILL: Record<MobileStatus, string> = { going: "geliyor", maybe: "bekliyor", declined: "gelmiyor", pending: "bekliyor" };

export default async function EtkinlikPaneli({ params, searchParams }: {
  params: Promise<{ manageToken: string }>;
  searchParams: Promise<{ bolum?: string; hata?: string; yeni?: string; yeniDavetli?: string; guncellendi?: string }>;
}) {
  const { manageToken } = await params;
  const { bolum, hata, yeni, yeniDavetli, guncellendi } = await searchParams;
  const row = await mobileEventByToken(manageToken, "manage");
  if (!row) notFound();

  const event = await managedEvent(row, siteUrl());
  const sum = mobileSummary(event.guests);
  const root = `/etkinlik/${manageToken}`;
  const active = bolum === "ekle" || bolum === "etkinlik" ? bolum : "liste";
  const fresh = yeniDavetli ? event.guests.find((g) => g.token === yeniDavetli) : undefined;
  const davetMetni = (ad: string, link: string) =>
    `Merhaba ${ad}, ${event.hostName} sizi "${event.title}" etkinliğine davet ediyor. ${longDate(event.date)}, saat ${event.time} · ${event.venue}. Katılım durumunuzu buradan bildirebilirsiniz: ${link}`;

  return (
    <Workspace
      title={event.title}
      subtitle={`${longDate(event.date)} · ${event.time} · ${event.venue}`}
      label="Etkinlik yönetimi"
      nav={[
        { label: "Davetliler", href: root, active: active === "liste", icon: "people" },
        { label: "Davetli ekle", href: `${root}?bolum=ekle`, active: active === "ekle", icon: "add" },
        { label: "Etkinlik", href: `${root}?bolum=etkinlik`, active: active === "etkinlik", icon: "invite" },
      ]}
      action={active !== "ekle" ? <Link className="btn" href={`${root}?bolum=ekle`}>+ Davetli ekle</Link> : undefined}
    >
      {hata && <p className="err" role="alert">{hata}</p>}
      {yeni && (
        <p className="info" role="status">
          Etkinliğiniz hazır. <b>Bu sayfanın linkini kaydedin</b> — yönetim linkiniz budur, kimseyle paylaşmayın.
        </p>
      )}
      {guncellendi && <p className="info" role="status">Değişiklikler kaydedildi.</p>}

      {fresh && (
        <section className="surface" role="status" style={{ marginBottom: 22 }}>
          <h2>{fresh.name} eklendi</h2>
          <p className="muted small">Kişiye özel link hazır. Mesajı kendi WhatsApp&apos;ınızdan gönderin.</p>
          <div className="linkbox">{davetMetni(fresh.name, fresh.rsvpUrl)}</div>
          <div className="btns">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(davetMetni(fresh.name, fresh.rsvpUrl))}`} target="_blank" rel="noopener noreferrer">WhatsApp&apos;ta aç</a>
            <Link className="btn ghost" href={`${root}?bolum=ekle`}>Bir davetli daha ekle</Link>
          </div>
        </section>
      )}

      {active === "liste" && (
        <>
          <div className="metric-grid" aria-label="Katılım özeti">
            <div className="metric"><span>Gelecek kişi</span><strong>{sum.people}</strong><small>Geliyorum diyenlerin toplamı</small></div>
            <div className="metric"><span>Belki</span><strong>{sum.maybe}</strong><small>Kararsız davet</small></div>
            <div className="metric"><span>Yanıt oranı</span><strong>{sum.invites ? `%${sum.answeredPct}` : "—"}</strong><small>{sum.invites ? `${sum.invites} davetin ${sum.invites - sum.waiting} tanesi yanıtlandı` : "Henüz davetli eklenmedi"}</small></div>
          </div>

          <section className="surface guest-surface">
            <h2>Davetliler ({event.guests.length})</h2>
            {event.guests.length === 0 && <p className="muted">Henüz davetli yok. Yukarıdan ilk davetliyi ekleyin.</p>}
            {event.guests.map((g) => (
              <div className="guest" key={g.id}>
                <div>
                  <div className="n">{g.name}</div>
                  <div className="tags">
                    {g.status === "going" && <span className="tag">{g.count} kişi</span>}
                    {g.note && <span className="tag">“{g.note}”</span>}
                  </div>
                </div>
                <span className={`pill ${PILL[g.status]}`}>{MOBILE_STATUS_LABEL[g.status]}</span>
                <div className="act">
                  <a className="lnk" href={`https://wa.me/?text=${encodeURIComponent(davetMetni(g.name, g.rsvpUrl))}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  <CopyButton text={davetMetni(g.name, g.rsvpUrl)} label="Mesajı kopyala" />
                </div>
                <details style={{ gridColumn: "1/-1" }}>
                  <summary className="lnk">Düzenle</summary>
                  <form action={setEventGuestAction.bind(null, manageToken, g.id)}>
                    <label className="lbl" htmlFor={`ad_${g.id}`}>Ad soyad</label>
                    <input type="text" id={`ad_${g.id}`} name="name" required maxLength={100} defaultValue={g.name} />
                    <div className="grid2">
                      <div>
                        <label className="lbl" htmlFor={`durum_${g.id}`}>Katılım</label>
                        <select id={`durum_${g.id}`} name="status" defaultValue={g.status}>
                          {DURUMLAR.map((d) => <option key={d} value={d}>{MOBILE_STATUS_LABEL[d]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="lbl" htmlFor={`kisi_${g.id}`}>Kaç kişi</label>
                        <select id={`kisi_${g.id}`} name="count" defaultValue={String(g.count)}>
                          {Array.from({ length: 20 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </select>
                      </div>
                    </div>
                    <label className="lbl" htmlFor={`not_${g.id}`}>Not</label>
                    <input type="text" id={`not_${g.id}`} name="note" maxLength={500} defaultValue={g.note} />
                    <button className="btn sm" type="submit" style={{ marginTop: 10 }}>Kaydet</button>
                  </form>
                  <form action={removeEventGuestAction.bind(null, manageToken, g.id)} style={{ marginTop: 12 }}>
                    <label className="tog small"><input type="checkbox" name="silOnay" /> <span>Bu davetliyi silmek istiyorum</span></label>
                    <button className="lnk" type="submit" style={{ color: "var(--no)", marginTop: 6 }}>Sil</button>
                  </form>
                </details>
              </div>
            ))}
          </section>
        </>
      )}

      {active === "ekle" && (
        <form action={addEventGuestAction.bind(null, manageToken)} className="surface" id="ekle">
          <h2>Davetli ekle</h2>
          <p className="muted small">Her davetliye kişiye özel bir link üretilir. Mesajı siz gönderirsiniz.</p>
          <label className="lbl" htmlFor="name">Ad soyad ya da aile</label>
          <input type="text" id="name" name="name" required maxLength={100} placeholder="Örn: Selin Kaya" />
          <button className="btn full" type="submit" style={{ marginTop: 12 }}>Ekle ve mesajı hazırla</button>
          <div className="info">Telefon numarası istemiyoruz. Davetli listesi etkinlikten 90 gün sonra silinir.</div>
        </form>
      )}

      {active === "etkinlik" && (
        <div className="stack">
          {designOf(row) && (
            <div className="yonet-kapak" style={themeScope(designOf(row)!.theme)}>
              <EventHero title={event.title} category={event.category} date={event.date} time={event.time}
                venue={event.venue} font={designOf(row)!.font} ornament={designOf(row)!.ornament} pattern={designOf(row)!.pattern} />
            </div>
          )}
          <section className="surface">
            <p className="eyebrow">Herkese açık davet linki</p>
            <h2>Paylaşmaya hazır</h2>
            <p className="muted small">Bu linki grupta paylaşabilirsiniz. Açan kişi adını yazıp yanıt verir.</p>
            <div className="linkbox">{event.shareUrl}</div>
            <div className="guest act" style={{ borderTop: 0, padding: 0 }}>
              <CopyButton text={event.shareUrl} label="Linki kopyala" />
              <a className="lnk" href={`https://wa.me/?text=${encodeURIComponent(`${event.hostName} sizi "${event.title}" etkinliğine davet ediyor: ${event.shareUrl}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp ile gönder</a>
              <a className="lnk" href={event.shareUrl} target="_blank" rel="noopener noreferrer">Daveti önizle</a>
            </div>
          </section>
          <section className="surface qr-kart">
            <p className="eyebrow">Afiş ya da basılı davet</p>
            <h2>QR kod</h2>
            <img src={`${root}/qr?bicim=svg`} alt="Davet QR kodu" width={132} height={132} />
            <p className="muted small">Okutan kişi davet sayfasını açar, adını yazıp yanıt verebilir.</p>
            <a className="btn ghost full" href={`${root}/qr`} download>QR kodu indir (PNG)</a>
            <a className="lnk spaced" href={`${root}/qr?bicim=svg`} download="buyrun-etkinlik-qr.svg" style={{ display: "inline-block" }}>Matbaa için vektörel (SVG)</a>
          </section>
          <section className="surface">
            <h2>Etkinlik bilgileri</h2>
            <p className="muted small">{event.category} · {longDate(event.date)} · {event.time}</p>
            <p className="muted small">{event.venue}{event.address ? `, ${event.address}` : ""}{event.capacity ? ` · kontenjan ${event.capacity}` : ""}</p>
            <Link className="btn ghost full" href={`${root}/duzenle`} style={{ marginTop: 10 }}>Etkinliği düzenle</Link>
            <div className="info">Veriler {event.deleteAfter} tarihinde otomatik silinir.</div>
          </section>
        </div>
      )}
    </Workspace>
  );
}
