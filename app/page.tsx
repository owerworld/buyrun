import type { Metadata } from "next";
import Link from "next/link";
import { InvitationCard } from "@/components/InvitationCard";

export const metadata: Metadata = { robots: { index: true, follow: true } };

export default function Home() {
  return (
    <main className="home-shell">
      <header className="home-header">
        <Link href="/" className="wordmark">buyrun<span>.</span></Link>
        <Link href="/kurtar" className="lnk">Davetiyeme dön</Link>
      </header>

      <section className="home-intro">
        <div className="home-copy">
          <p className="eyebrow">Dijital davetiye · Birlikte kutlamak için</p>
          <h1>Güzel gününüzün<br /><em>ilk daveti.</em></h1>
          <p>
            Düğünden doğum gününe, mezuniyetten ev partisine… Davetiyenizi hazırlayın,
            sevdiklerinize gönderin, kimin geleceğini tek bakışta görün.
          </p>
          <div className="home-actions">
            <Link className="btn" href="/basla">Davetimi hazırla <span aria-hidden="true">→</span></Link>
            <Link className="btn ghost" href="/olustur">Formu kendim dolduracağım</Link>
          </div>
          <p className="home-note">
            Birkaç soru soruyoruz, gerisini biz hazırlıyoruz. Üyelik yok, uygulama indirmek yok.
          </p>
        </div>
        <div className="home-invite">
          <InvitationCard nameA="Defne" nameB="Mert" date="2027-06-19" city="İSTANBUL" />
          <p className="muted small centered">Sizin isimleriniz. Sizin gününüz. Sizin davetiyeniz.</p>
        </div>
      </section>

      <section className="home-paths" aria-label="İki davet türü">
        <div>
          <p className="eyebrow">Düğün davetiyesi</p>
          <h2>Kına, nişan, söz ve düğün</h2>
          <p>
            Kız evi ve oğlan evi kendi davetlisini yönetir, salon için gereken toplam
            iki listeden birleşir. Servis saatleri ve günün programı davetiyede yer alır.
          </p>
          <Link className="lnk" href="/basla?tur=dugun">Düğün davetiyesi oluştur →</Link>
        </div>
        <div>
          <p className="eyebrow">Etkinlik daveti</p>
          <h2>Doğum günü, yemek, mezuniyet…</h2>
          <p>
            Tek ev sahibi, tek liste. Davetli “geliyorum”, “belki” ya da “gelemiyorum”
            der; kontenjanınızı aşmadan kaç kişi olacağınızı bilirsiniz.
          </p>
          <Link className="lnk" href="/basla">Etkinlik daveti oluştur →</Link>
        </div>
      </section>

      <section className="home-steps" aria-label="Nasıl çalışır?">
        <div><span>01</span><h2>Sorulara cevap ver</h2><p>Zevkinizi soran birkaç soru. Hepsi tek dokunuş; davetinizi ona göre hazırlıyoruz.</p></div>
        <div><span>02</span><h2>Sevdiklerini davet et</h2><p>Her davetliye özel bir link oluşur. Hazır mesajı kendi WhatsApp&apos;ınızdan paylaşırsınız.</p></div>
        <div><span>03</span><h2>Birlikte planla</h2><p>Yanıtlar anında düşer; kaç kişi geleceğini ve kimin yanıt vermediğini görürsünüz.</p></div>
      </section>

      <footer className="home-footer">
        <p>Telefon numarası istemiyoruz. Misafir listesi son etkinlikten 90 gün sonra silinir.</p>
        <Link href="/gizlilik">Gizlilik ve KVKK</Link>
      </footer>
    </main>
  );
}
