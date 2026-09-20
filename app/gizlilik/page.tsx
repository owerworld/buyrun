import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Gizlilik ve KVKK – Buyrun", robots: { index: true, follow: true } };

export default function Gizlilik() {
  return (
    <main className="wrap">
      <div className="brand"><Link href="/">Buyrun</Link></div>
      <article className="card small">
        <p className="err" style={{ marginTop: 0 }}>TASLAK: Bu metin avukat onayından geçmeden yayına alınmayacaktır. Veri sorumlusu unvanı ve iletişim bilgileri şirket yapısı netleşince eklenecektir.</p>
        <h1 className="title">Gizlilik ve kişisel verilerin korunması</h1>
        <h3>Hangi verileri topluyoruz?</h3>
        <p>Davetiyeyi oluşturan çiftin adları ve etkinlik bilgileri (tarih, saat, yer, servis, program). Davetliler için yalnızca ailenin girdiği ad ve davetlinin verdiği katılım yanıtı, kişi sayısı ve isteğe bağlı not.</p>
        <h3>Hangi verileri toplamıyoruz?</h3>
        <p>Telefon numarası, e-posta, konum, fotoğraf ya da banka bilgisi istemiyoruz. Davetiyeler aile tarafından kendi WhatsApp hesaplarından gönderilir, sistemimiz kimseye mesaj göndermez. Para toplamıyoruz.</p>
        <h3>Ne kadar saklıyoruz?</h3>
        <p>Tüm davetiye ve davetli verileri son etkinlik tarihinden 90 gün sonra otomatik ve kalıcı olarak silinir.</p>
        <h3>Kimler görebilir?</h3>
        <p>Davetli listesini yalnızca ilgili ailenin panel linkine sahip kişiler görür. Linkler tahmin edilemez şekilde üretilir ve arama motorlarına kapalıdır.</p>
        <h3>Haklarınız</h3>
        <p>KVKK'nın 11. maddesi kapsamındaki haklarınız için bize ulaşabilirsiniz. (İletişim bilgisi eklenecek.)</p>
      </article>
    </main>
  );
}
