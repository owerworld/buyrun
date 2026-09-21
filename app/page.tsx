import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { robots: { index: true, follow: true } };

export default function Home() {
  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link></div>
      <section className="card">
        <h1 className="title">Kına ve düğün tek linkte</h1>
        <p className="muted">Davetlilerin uygulama indirmeden tek dokunuşla katılım bildirir. Kız evi ve oğlan evi kendi listesini yönetir, salon için toplam sayı otomatik çıkar.</p>
        <Link className="btn full" href="/olustur">Davetiyeni oluştur</Link>
      </section>
      <section className="card small">
        <h2>Nasıl çalışır?</h2>
        <p><b>Davetiyeni hazırla.</b> Kına, nikâh ve düğün bilgileri, servis ve günün programı.</p>
        <p><b>İki aile kendi panelinden davetli ekler.</b> Her davetliye özel link oluşur, mesajı kendi WhatsApp'ından gönderirsin.</p>
        <p><b>Yanıtlar anında düşer.</b> Kaç kişi geleceğini ve kimin yanıt vermediğini görürsün.</p>
        <p className="muted">Telefon numarası istemiyoruz, para toplamıyoruz. Misafir listesi son etkinlikten 90 gün sonra otomatik silinir.</p>
        <p className="small">Davetiyeniz zaten var ama yönetim linkini kaybettiyseniz: <Link href="/kurtar">yönetim linkini kurtar</Link></p>
      </section>
    </main>
  );
}
