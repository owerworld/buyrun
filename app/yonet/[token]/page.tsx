import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureRecoveryCode, getAdmin, SIDE_LABEL, summarize } from "@/lib/data";
import { siteUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";

export default async function Yonet({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ guncellendi?: string }>;
}) {
  const { token } = await params;
  const { guncellendi } = await searchParams;
  const data = await getAdmin(token);
  if (!data) notFound();
  const { inv, events, families, guests } = data;
  const sum = summarize(guests, events);
  const base = siteUrl();
  const recovery = await ensureRecoveryCode(token);

  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link></div>
      {guncellendi && <p className="info" role="status" style={{ marginTop: 0 }}>Davetiye güncellendi. Davetlileriniz yeni bilgileri görüyor.</p>}
      <section className="card">
        <h1 className="title">{inv.name_a} ile {inv.name_b}</h1>
        <p className="muted">Davetiyeniz hazır. Bu sayfa yönetim sayfanız, linkini kaydedin ve kimseyle paylaşmayın.</p>
        <div className="linkbox">{`${base}/yonet/${token}`}</div>
        <CopyButton text={`${base}/yonet/${token}`} label="Yönetim linkini kopyala" />
        <div className="info" style={{ marginTop: 12 }}>
          <b>Kurtarma kodunuz: <span style={{ letterSpacing: ".12em" }}>{recovery}</span></b>
          <br />Bu kodu bir yere yazın ya da ekran görüntüsünü alın. Yönetim linkini kaybederseniz{" "}
          <Link href="/kurtar">kurtar sayfasından</Link> bu kodla geri dönersiniz.
          {" "}<CopyButton text={recovery} label="Kodu kopyala" />
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          <Link className="btn ghost" href={`/onizleme/${token}`}>Davetiyeyi önizle</Link>
          <Link className="btn ghost" href={`/yonet/${token}/duzenle`}>Davetiyeyi düzenle</Link>
        </div>
      </section>

      <section className="card">
        <h2>Aile panelleri</h2>
        <p className="muted small">Her aile kendi davetlilerini kendi panelinden ekler. Oğlan evi panelinin linkini damadın ailesine gönderin.</p>
        {families.map((f) => {
          const url = `${base}/p/${f.panel_token}`;
          const msg = `${inv.name_a} ile ${inv.name_b} düğünü için ${SIDE_LABEL[f.side].toLowerCase()} davetli paneli: ${url}\nBu linki sadece aile içinde paylaşın.`;
          return (
            <div key={f.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 12 }}>
              <h3>{SIDE_LABEL[f.side]} paneli</h3>
              <div className="linkbox">{url}</div>
              <div className="guest act" style={{ borderTop: 0, padding: 0 }}>
                <Link className="lnk" href={`/p/${f.panel_token}`}>Paneli aç</Link>
                <CopyButton text={url} label="Linki kopyala" />
                <a className="lnk" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">WhatsApp ile gönder</a>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card">
        <h2>Ortak sayım</h2>
        <div className="stats">
          <div className="stat"><b>{sum.people}</b><span>Gelecek kişi</span></div>
          <div className="stat"><b>{sum.waiting}</b><span>Yanıt bekleyen davet</span></div>
        </div>
        <div className="heads">{sum.perEvent.map((e) => <div key={e.id} className={`head ${e.kind}`}>{e.title}<br /><b>{e.people}</b> kişi</div>)}</div>
      </section>
    </main>
  );
}
