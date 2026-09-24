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
        <p>Bu metin Buyrun web sitesi, davet sayfaları ve Buyrun mobil uygulaması (Android, iPhone ve tarayıcı sürümü) için geçerlidir.</p>

        <h3>Hangi verileri topluyoruz?</h3>
        <p><b>Ev sahibinden:</b> davetin adı, ev sahibi adı, tarih, saat, mekân ve isteğe bağlı adres, açıklama, kişi hedefi, program ve servis bilgileri. Ev sahibi dilerse kendi kapak fotoğrafını yükleyebilir; bu fotoğraf yalnızca davet sayfasında gösterilir.</p>
        <p><b>Davetliden:</b> ev sahibinin girdiği ya da davetlinin kendi yazdığı ad, katılım yanıtı, kişi sayısı, isteğe bağlı not; ev sahibi oylama veya soru eklediyse davetlinin seçtiği tarihler ve isteğe bağlı cevapları.</p>

        <h3>Hangi verileri toplamıyoruz?</h3>
        <p>Telefon numarası, e-posta, konum ya da banka bilgisi istemiyoruz. Üyelik yok. Reklam ve izleme (analitik) servisi kullanmıyoruz. Davetler ev sahibinin kendi WhatsApp'ından ya da paylaşım menüsünden gönderilir; sistemimiz kimseye mesaj göndermez. Davetliden para istemiyoruz.</p>

        <h3>Kimler görebilir?</h3>
        <p>Davetli listesini, notları ve soru cevaplarını yalnızca ev sahibi (yönetim kodu ya da panel bağlantısı olan kişi) görür. Davetliler başka davetlilerin adlarını ve cevaplarını görmez; tarih oylamasında yalnızca toplam sayılar görünür. Bağlantılar tahmin edilemez şekilde üretilir ve arama motorlarına kapalıdır.</p>

        <h3>Cihazda ne saklanır?</h3>
        <p>Mobil uygulama, hazırladığınız davetleri ve yönetim kodlarını telefonunuzda saklar; yönetim kodları cihazın güvenli depolama alanında tutulur. Uygulamayı silerseniz davetleriniz sunucuda kalır ve yönetim kodunuzla geri getirebilirsiniz.</p>

        <h3>Üçüncü taraflar</h3>
        <p>Site ve veritabanı yurt dışında bulunan hizmet sağlayıcılarda barındırılır (Vercel ve Neon). Ev sahibi &ldquo;davet metnini yaz&rdquo; özelliğini kullanırsa davetin adı, ev sahibi adı, tarih, mekân ve sihirbaz cevapları metin üretimi için Anthropic&apos;e gönderilir; davetli bilgileri bu amaçla gönderilmez.</p>

        <h3>Ne kadar saklıyoruz?</h3>
        <p>Tüm davet ve davetli verileri etkinlik tarihinden 90 gün sonra otomatik ve kalıcı olarak silinir. Ev sahibi dilediği an uygulamadaki &ldquo;Daveti sil&rdquo; ile daveti, davetli listesini ve tüm yanıtları hemen ve kalıcı olarak silebilir.</p>

        <h3>Haklarınız</h3>
        <p>KVKK&apos;nın 11. maddesi kapsamındaki haklarınız için bize ulaşabilirsiniz. (İletişim bilgisi eklenecek.)</p>
      </article>
    </main>
  );
}
