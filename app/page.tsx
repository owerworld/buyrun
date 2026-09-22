import type { Metadata } from "next";
import Link from "next/link";
import { InvitationCard } from "@/components/InvitationCard";
export const metadata: Metadata = { robots: { index: true, follow: true } };
export default function Home() {
  return <main className="home-shell">
    <header className="home-header"><Link href="/" className="wordmark">buyrun<span>.</span></Link><Link href="/kurtar" className="lnk">Davetiyeme dön</Link></header>
    <section className="home-intro"><div className="home-copy"><p className="eyebrow">Dijital davetiye · Birlikte kutlamak için</p><h1>Güzel gününüzün<br /><em>ilk daveti.</em></h1><p>Düğün, nişan veya söz… Davetiyenizi hazırlayın, sevdiklerinize gönderin. Kimin geleceğini iki aile birlikte takip etsin.</p><Link className="btn" href="/olustur">Davetiyeni oluştur <span aria-hidden="true">→</span></Link><p className="home-note">Üyelik yok. Uygulama indirmek yok.</p></div><div className="home-invite"><InvitationCard nameA="Defne" nameB="Mert" date="2027-06-19" city="İSTANBUL" /><p className="muted small centered">Sizin isimleriniz. Sizin gününüz. Sizin davetiyeniz.</p></div></section>
    <section className="home-steps" aria-label="Nasıl çalışır?"><div><span>01</span><h2>Davetiyeni hazırla</h2><p>Gününüzü, yerinizi ve temanızı seçin. Kına veya after party'yi aynı davetiyeye ekleyin.</p></div><div><span>02</span><h2>Sevdiklerini davet et</h2><p>Her aile kendi listesini yönetir. Hazır mesajı kendi WhatsApp'ınızdan paylaşırsınız.</p></div><div><span>03</span><h2>Birlikte planla</h2><p>Yanıtları ve her etkinliğe gelecek kişi sayısını tek bakışta görün.</p></div></section>
    <footer className="home-footer"><p>Telefon numarası istemiyoruz. Misafir listesi son etkinlikten 90 gün sonra silinir.</p><Link href="/gizlilik">Gizlilik ve KVKK</Link></footer>
  </main>;
}
