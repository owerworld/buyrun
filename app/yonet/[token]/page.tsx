import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureRecoveryCode, getAdmin, SIDE_LABEL, summarize } from "@/lib/data";
import { shortDate, siteUrl, dayNum, monShort } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { Workspace } from "@/components/Workspace";
import { AttendanceStats, ResponseChart, EventChart } from "@/components/Attendance";
import { InvitationCard } from "@/components/InvitationCard";
import { themeOf } from "@/lib/themes";

export default async function Yonet({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ guncellendi?: string; bolum?: string }> }) {
  const { token } = await params;
  const { guncellendi, bolum } = await searchParams;
  const data = await getAdmin(token);
  if (!data) notFound();
  const { inv, events, families, guests } = data;
  const sum = summarize(guests, events);
  const base = siteUrl();
  const recovery = await ensureRecoveryCode(token);
  const active = bolum === "aileler" || bolum === "davetiye" ? bolum : "ozet";
  const root = `/yonet/${token}`;
  return <Workspace title={`${inv.name_a} ile ${inv.name_b}`} subtitle={`${shortDate(inv.main_date)}${inv.city ? ` · ${inv.city}` : ""}`} label="Çiftin yönetim alanı"
    nav={[{ label: "Genel bakış", href: root, active: active === "ozet", icon: "overview" }, { label: "Aile panelleri", href: `${root}?bolum=aileler`, active: active === "aileler", icon: "people" }, { label: "Davetiye", href: `${root}?bolum=davetiye`, active: active === "davetiye", icon: "invite" }]}
    action={<Link className="btn ghost" href={`/onizleme/${token}`}>Davetiyeyi önizle <span aria-hidden="true">↗</span></Link>}>
    {guncellendi && <p className="info" role="status">Davetiye güncellendi. Davetlileriniz yeni bilgileri görüyor.</p>}
    {active === "ozet" && <>
      <div className="section-heading page-section-title"><h2>Bir bakışta hazırlıklar</h2><span className="muted small">İki ailenin ortak sayımı</span></div>
      <AttendanceStats summary={sum} />
      <div className="dashboard-grid"><div className="stack"><ResponseChart summary={sum} /><EventChart summary={sum} /></div>
        <div className="stack"><section className="surface event-agenda"><div className="section-heading"><h2>Büyük günler</h2></div>{events.map((e) => <div className="agenda-row" key={e.id}><div className="agenda-date"><b>{dayNum(e.event_date)}</b><span>{monShort(e.event_date)}</span></div><div><h3>{e.title}</h3><p>{e.event_time} · {e.venue}</p></div></div>)}<Link className="lnk" href={`${root}/duzenle`}>Etkinlik bilgilerini düzenle</Link></section>
        <section className="next-step"><p className="eyebrow">Birlikte hazırlanın</p><h2>Her aileye kendi alanı.</h2><p>Aile panelini paylaşın; herkes kendi davetlilerini kolayca eklesin.</p><Link className="btn" href={`${root}?bolum=aileler`}>Aile panellerine git <span aria-hidden="true">→</span></Link></section></div></div>
    </>}
    {active === "aileler" && <>
      <div className="page-section-title"><h2>Aile panelleri</h2><p className="muted">Her aile yalnızca kendi davetlilerini görür. Toplam katılım sayısı ortaktır.</p></div>
      <div className="family-grid">{families.map((f) => {
        const url = `${base}/p/${f.panel_token}`;
        const fs = summarize(guests.filter((g) => g.family_id === f.id), events);
        const msg = `${inv.name_a} ile ${inv.name_b} daveti için ${SIDE_LABEL[f.side].toLowerCase()} davetli paneli: ${url}\nBu linki sadece aile içinde paylaşın.`;
        return <section className="surface family-card" key={f.id}><span className="family-monogram" aria-hidden="true">{(f.side === "kiz" ? inv.name_a : inv.name_b).slice(0, 1)}</span><p className="eyebrow">{f.side === "kiz" ? inv.name_a : inv.name_b} tarafı</p><h2>{SIDE_LABEL[f.side]}</h2><p className="muted">{fs.invites} davet · {fs.people} kişi katılacak</p><Link className="btn full" href={`/p/${f.panel_token}`}>Paneli aç <span aria-hidden="true">→</span></Link><div className="family-actions"><CopyButton text={url} label="Linki kopyala" /><a className="lnk" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">WhatsApp'ta aç</a></div></section>;
      })}</div><p className="info">Aile paneli linkini sadece ilgili aileyle paylaşın. Davetlilere, aile panelinden oluşturulan kişisel davetiye linki gönderilir.</p>
    </>}
    {active === "davetiye" && <div className="invitation-workspace"><div><InvitationCard nameA={inv.name_a} nameB={inv.name_b} date={inv.main_date} city={inv.city} theme={inv.theme} /><p className="muted small centered">{themeOf(inv.theme).label} teması · Davetiyenizin kapak görünümü</p></div><div className="stack"><section className="surface"><p className="eyebrow">Sizin davetiyeniz</p><h2>Her ayrıntı yerli yerinde.</h2><p className="muted">İsimleri, tarihleri, mekânı veya temayı dilediğiniz zaman güncelleyin. Davetli linkleri aynı kalır.</p><Link className="btn full" href={`${root}/duzenle`}>Davetiyeyi düzenle</Link><Link className="btn ghost full spaced" href={`/onizleme/${token}`}>Önizle ve hikâye görselini indir</Link></section><section className="surface"><h2>Paylaşmaya hazır</h2><p className="muted">Kişiye özel davetleri aile panelinden hazırlayın. WhatsApp önizleme posteri seçtiğiniz temayı kullanır.</p><Link className="lnk" href={`${root}?bolum=aileler`}>Aile panellerine git →</Link></section></div></div>}
    <details className="access-details"><summary>Yönetim linki ve kurtarma kodu <span className="muted small">· Size özel</span></summary><p className="muted small">Bu bilgileri saklayın ve kimseyle paylaşmayın.</p><div className="linkbox">{`${base}${root}`}</div><CopyButton text={`${base}${root}`} label="Yönetim linkini kopyala" /><div className="recovery-row"><strong>{recovery}</strong><CopyButton text={recovery} label="Kodu kopyala" /></div><p className="muted small">Linki kaybederseniz <Link href="/kurtar">bu kodla geri dönebilirsiniz.</Link></p></details>
  </Workspace>;
}
