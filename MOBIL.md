# Buyrun · mobil sürüm

Bu teslim, Expo / React Native ile hazırlanmış iOS ve Android uygulamasının kaynak kodunu ve uygulamanın kullandığı API sunucusunu içerir.

## Aç ve incele

- Bilgisayardaki mobil önizleme: http://127.0.0.1:8081/templates
- Aynı Wi-Fi üzerindeki tarayıcı önizlemesi: http://192.168.1.157:8081
- Yerel API: http://192.168.1.157:3000

Bu adresler bu bilgisayardaki geliştirme sunucuları açık olduğu sürece çalışır. Tarayıcı önizlemesi, mobil uygulamanın aynı React Native ekranlarını gösterir; APK veya iPhone kurulumu değildir.

## Neler değişti?

- Planlar, Tasarımlar, Oluştur ve Profil alt menüsü.
- Turuncu/kiraz, kobalt/sofra ve lila/çiçek temalı üç özgün kapak; yeni uygulama simgesi.
- Galeriden kişisel fotoğraf seçme, görseli boyutlandırma ve davetiyeye kaydetme.
- Kapak → bilgiler → önizleme şeklinde üç adımlı oluşturma; cihazda taslak kaydı.
- Etkinlik ayrıntısında Davetiye, Davetliler ve Özet bölümleri.
- Davetli ekleme, isim arama, durum filtreleme, katılım ve kişi sayısı düzenleme.
- Yanıt oranı, katılım dağılımı ve kişi hedefini gerçek kayıtlardan hesaplayan grafikler.
- Genel ve kişisel davet bağlantıları; davetliler uygulama indirmeden yanıtlayabilir.
- Yönetim koduyla cihaz değiştirme; native cihazda güvenli anahtar saklama ve süre dolumunda temizleme.

Örnek planlar açıkça işaretlidir. Deneme akışında oluşturulan “Bir masada buluşalım · Deneme” yalnızca yerel kontrol kaydıdır.

## Paket

`buyrun-mobil-kaynak.zip` içinde:

- `buyrun-mobile/`: gerçek Expo / React Native uygulaması. Ayrıntılı çalıştırma ve derleme adımları kendi README dosyasındadır.
- `buyrun/`: Next.js API ve davetlinin katılım yanıtını bıraktığı sayfalar. Mobil API, önceki düğün/aile verilerinden ayrı tablolar kullanır.

Gerçek ortam değişkenleri, kişisel veritabanı, yönetim kodları, imzalama dosyaları ve bağımlılık klasörleri pakete dahil edilmedi. Görsellerin üretim açıklamaları mobil projenin assets klasöründedir.

## Doğrulama

- TypeScript ve ESLint temiz.
- Expo Doctor: 21/21 kontrol geçti.
- iOS, Android ve web JavaScript/varlık derlemeleri dışa aktarıldı.
- API: 55 HTTP kontrolü; sunucu üretim derlemesi başarılı.
- Depolama: 37 kontrol; üretim bağlantısı yapılandırması: 7 kontrol.
- 390 piksel telefon görünümünde oluşturma, galeri yükleme, düzenleme, davetli ekleme, 2 kişilik katılım, grafikler ve yeniden açıldığında kayıtların korunması kontrol edildi.

## Kurulum ve yayın için kalan adımlar

Henüz imzalı APK/IPA veya mağaza yayını oluşturulmadı. Bu bilgisayarda Expo oturumu açık değil; Xcode ve Android SDK da kurulu değil. Native galeri, paylaşım ve güvenli depolama davranışları gerçek telefonda ayrıca doğrulanmalı.

Dağıtım için API sunucusunun HTTPS üzerinde yayımlanması ve mobil projenin bu adrese bağlanması gerekiyor. Expo hesabıyla Android APK üretilebilir; iOS/TestFlight için Apple Developer hesabı ve imzalama gerekir. Mevcut uzak depoya yazma erişimi olmadığı için canlı sitede değişiklik yapılmadı.

Sunucuda otomatik silme, etkinlikten 90 gün sonrası için ayarlanan korumalı günlük temizleme göreviyle gerçekleşir; yerel önizleme kendi kendine zamanlanmış temizlik başlatmaz.
