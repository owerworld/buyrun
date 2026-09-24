# Buyrun — son ürün kuralları

Bu kurallar birleşik sürümün "anayasası"dır. Yeni bir özellik bu kurallardan birini bozuyorsa, önce ürün sahibine (Ramazan Say) açıkça sorulur.

## 1. Ana fikir
- Buyrun, **davetiye hazırlayıp paylaşma ve katılımı yönetme** uygulamasıdır.
- Temel akış: **vesile seç → tasarım bul → kişiselleştir → önizle → son adım → paylaş → katılımı yönet.**
- Ev sahibi **Android/iOS uygulamasını** kullanır. Next.js tarafı sunucu ve davetli sayfalarıdır; ürün web sitesine dönüştürülmez.
- Davetli **uygulama indirmeden**, yalnızca bağlantıyla yanıt verir.

## 2. Fiyat ve ödeme
- Yayın fiyatı: **davet başına ₺49,99, tek seferlik.** Abonelik, gizli ücret, "son 2 saat" gibi sayaç yoktur.
- Fiyat, davet **hazırlandıktan sonra son adımda** gösterilir; kullanıcının önüne satış ekranı konmaz.
- **Test sürümünde ödeme alınmaz** ve bu açıkça yazılır.
- Gerçek tahsilat ancak şu dördü birlikte hazır olduğunda açılır: mağaza ürünü (App Store / Google Play), sunucuda satın alma doğrulaması, hata durumu, iptal/iade durumu.
- Buyrun davetliden **asla para istemez**; IBAN, "takı/para gönder" gibi alanlar yoktur. Davetli sayfasında bu uyarı yazar.

## 3. Veri ve gizlilik
- Davetliden telefon numarası istenmez; yalnızca ad, katılım durumu, kişi sayısı, isteğe bağlı not ve isteğe bağlı soru yanıtları.
- **Özel soru yanıtları ve notlar yalnızca ev sahibine görünür**; diğer davetlilere ne isim ne yanıt döner. Oylamada davetliler yalnızca toplam sayıyı görür.
- Davet bağlantıları arama motorlarına kapalıdır (`noindex`, `no-referrer`).
- Davet bilgileri **etkinlikten 90 gün sonra silinir**; plan verileri (oylama, sorular, duyurular) da etkinlikle birlikte silinir.
- Ev sahibi daveti istediği an **"Daveti sil"** ile kalıcı olarak silebilir (davetliler, yanıtlar, oylama ve sorular dahil). Silme için yönetim kodu gerekir; davet bağlantısıyla silinemez.
- Hesap yok; davetler cihazda durur. Kullanıcıya ilk davetten sonra **yönetim kodunu kendine göndermesi** hatırlatılır.
- Sistem **kimseye kendiliğinden mesaj göndermez.** Paylaşım ev sahibinin kendi WhatsApp'ından / paylaş menüsünden yapılır. Hatırlatma, davetlinin kendi takvimine eklediği dosyadaki alarmla çalışır.
- İzin ve altyapı olmadan izleme/analitik servisi eklenmez, dışarıya veri gönderilmez.
- Şifreler, API anahtarları ve imza anahtarları kaynak koduna ve teslim ZIP'ine konmaz.

## 4. Veritabanı
- Değişiklikler yalnızca **ekleme** türündedir (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`).
- Mevcut kullanıcı kayıtları, davet bağlantıları ve yönetim yetkileri korunur.
- Sıfırlama, silme veya kısıt değiştirme gibi geri dönüşü olmayan işlemler için önce ürün sahibinin onayı alınır.

## 5. Görsel dil
- Özgün görseller ve yazı tipleri (Manrope, Cormorant Garamond) korunur; yeni görseller yalnızca **ek seçenek** olarak eklenir.
- **Cam efekti yalnızca gezinme ve kontrollerde** (alt çubuk, üst düğmeler). İçerik kartları düz ve okunaklıdır. "Saydamlığı azalt" ayarı açıksa cam kapanır.
- Bir ekranda tek ana eylem vardır (limon yeşili düğme). İkincil eylemler beyaz düğmedir.
- Kapak yazısı illüstrasyonun boş alanına yerleşir; uzun Türkçe başlıklar küçülür ama kesilmez.

## 6. Kullanılabilirlik
- 320 px genişliğe kadar ekranlar, büyük yazı tipi, açık klavye ve yavaş bağlantı denetlenir.
- Her veri ekranında **yükleniyor / boş / hata / kaydediliyor / başarılı** durumları vardır.
- Sahte sayaç, sahte istatistik, yanıltıcı indirim, zorunlu arkadaş daveti, gereksiz görev yoktur.
- Rakiplerin görselleri, markaları veya ekranları birebir kopyalanmaz; yalnızca çözdükleri **problem** incelenir.

## 7. Yayın
- Her değişiklik önce yerel/test ortamında doğrulanır.
- Bu dala gönderilen her commit `buyrun.vercel.app` adresine otomatik yayınlanır; bu yüzden gönderimden önce derleme ve testler çalıştırılır.
- Yayınlanmamış bir sürüm "yayınlandı" diye sunulmaz.
