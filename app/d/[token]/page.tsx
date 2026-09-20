import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuest, inviteLabel, list } from "@/lib/data";
import { shortDate } from "@/lib/format";
import { EventsCard, Hero, SiteFooter } from "@/components/Invite";
import { respondAction } from "../../actions";

/** WhatsApp/Telegram link önizlemesi: çiftin adları, tarih ve şehir. Davetlinin adı paylaşılmaz. */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const data = await getGuest(token);
  if (!data) return { title: "Davetiye bulunamadı" };
  const { inv, events } = data;
  const title = `${inv.name_a} ile ${inv.name_b} · ${inviteLabel(events)}`;
  const description = `${[shortDate(inv.main_date), inv.city].filter(Boolean).join(" · ")} — Davetiyeyi açıp katılım durumunuzu bildirebilirsiniz.`;
  return { title, description, openGraph: { type: "website", locale: "tr_TR", siteName: "Buyrun", title, description } };
}

export default async function Davet({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ duzenle?: string; tamam?: string; hata?: string }> }) {
  const { token } = await params;
  const sp = await searchParams;
  const data = await getGuest(token);
  if (!data) notFound();
  const { guest: g, inv, events } = data;
  const kinds = events.map((e) => e.kind);
  const greet = kinds.includes("kina") && kinds.includes("dugun") ? "kınamızda ve düğünümüzde" : kinds.includes("kina") ? "kına gecemizde" : "düğünümüzde";
  const answered = g.status !== "bekliyor" && sp.duzenle !== "1";
  const attended = list(g.attend_ids);
  const act = respondAction.bind(null, token);

  return (
    <main className="wrap">
      <Hero inv={inv} greeting={<>Sevgili <b>{g.name}</b>, {greet} sizi aramızda görmek istiyoruz.</>} />
      <EventsCard inv={inv} events={events} />

      {answered ? (
        <section className="card done" aria-live="polite">
          <div className="seal" style={sp.tamam ? undefined : { animation: "none" }}>{g.status === "geliyor" ? <>Görüşmek<br />üzere</> : <>Teşekkür<br />ederiz</>}</div>
          <h2 style={{ marginBottom: 4 }}>Yanıtınız iletildi</h2>
          <p className="muted" style={{ margin: 0 }}>
            {g.status === "geliyor"
              ? `${g.count} kişi olarak ${events.filter((e) => attended.includes(e.id)).map((e) => e.title.toLocaleLowerCase("tr")).join(" ve ")} için kaydınız alındı.`
              : "Gelemeyeceğinizi çiftimize ilettik."}
          </p>
          <p style={{ marginTop: 12 }}><Link className="btn ghost sm" href={`/d/${token}?duzenle=1`}>Yanıtı değiştir</Link></p>
          <div className="info" style={{ textAlign: "left" }}>Sen de bir davet mi düzenliyorsun? Düğün, nişan ya da kına için davetiyeni birkaç dakikada hazırla. <Link href="/">Buyrun ile oluştur</Link></div>
        </section>
      ) : (
        <form action={act} className="card">
          <h2>Katılım durumunuz</h2>
          <p className="muted small" style={{ marginTop: -4 }}>Üye olmanıza gerek yok.</p>
          {sp.hata && <p className="err" role="alert">{sp.hata}</p>}
          <fieldset>
            <legend className="sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Katılım</legend>
            <div className="choice">
              <label><input className="yes" type="radio" name="status" value="geliyor" defaultChecked={g.status === "geliyor"} required /><span>Geliyorum</span></label>
              <label><input className="noo" type="radio" name="status" value="gelmiyor" defaultChecked={g.status === "gelmiyor"} /><span>Gelemiyorum</span></label>
            </div>
          </fieldset>
          <div className="row">
            <label htmlFor="count">Geliyorsanız kaç kişi?</label>
            <select id="count" name="count" defaultValue={String(Math.max(1, g.count))} style={{ width: 90 }}>
              {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
          {events.length > 1 && events.map((e) => (
            <div className="row" key={e.id}>
              <label className="tog"><input type="checkbox" name="attend" value={e.id} defaultChecked={attended.length ? attended.includes(e.id) : true} /> {e.title}</label>
            </div>
          ))}
          <label className="lbl" htmlFor="note">Çifte bir not bırakın (isteğe bağlı)</label>
          <textarea id="note" name="note" maxLength={200} defaultValue={g.note} placeholder="Örn: Mutluluklar dileriz!" />
          <button className="btn full" type="submit" style={{ marginTop: 12 }}>Yanıtı gönder</button>
        </form>
      )}
      <SiteFooter />
    </main>
  );
}
