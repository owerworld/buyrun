# Buyrun · Yerel test paketi

## Android uygulaması

`Buyrun-Android-Test.apk` dosyasını Android telefonuna aktar ve aç. Bu, ARM64 telefonlar için kurulabilir **Buyrun Test 1.1.0** uygulamasıdır; Expo Go gerektirmez. Fiziksel telefonda denenmedi.

Telefon ve bu bilgisayar aynı Wi-Fi ağına bağlı olmalı. Yerel sunucu adresi: **http://192.168.1.170:3001**. Bilgisayar açık ve sunucu çalışır durumda kalmalı. Bu adres Wi-Fi dışından erişilemez; davet bağlantıları da bu testte yalnızca aynı ağda açılır.

Sunucu bu teslim sırasında çalışıyor. Yeniden başlatman gerektiğinde kaynak ZIP'ini açıp `buyrun/scripts/start-local.command` dosyasını çalıştır. İlk çalıştırmada gerekli paketler internetten kurulur; Node.js 22 veya üzeri gerekir. Mevcut sunucu çalışırken ikinci kez başlatma. Kayıtlar sunucunun `.data/pglite` klasöründe tutulur; ayrı bir proje kopyasını başlatmak boş bir test veritabanı oluşturur.

Bilgisayarın IP adresi değişirse APK yeniden derlenmelidir. Projedeki `buyrun-mobile/scripts-build-local.sh` bu iş içindir. Geliştirme araçları bu bilgisayarda `/Users/ugur/.cache/buyrun-builds/tools` altında hazırdır.

## iPhone projesi

`Buyrun-Guncel-Proje.zip` içinde Expo/React Native kaynakları ve `buyrun-mobile/ios/Buyrun.xcodeproj` bulunur. iOS JavaScript derlemesi kontrol edildi. **Bu paket imzalı IPA veya TestFlight değildir; şu anda doğrudan iPhone'a kurulamaz.** Xcode/CocoaPods kurulumu ve Apple imzası tamamlanınca cihaz sürümü üretilebilir. Sunucu yayını ve hesap girişleri isteğin doğrultusunda ertelendi.

## Neler değişti?

74 tasarım, 17 kategori, çizim ve fotoğraf seçenekleri, favoriler, cam görünümlü gezinme, yenilenmiş davet oluşturma, katılım grafikleri, tarih oylaması, özel sorular, duyurular, hazırlık listesi, görsel/QR ve takvim paylaşımı.

**₺49,99 tek seferlik fiyat son adımda gösterilir; bu testte ücret alınmaz.** Gerçek mağaza ödemesi henüz bağlı değildir.

`GUNCELLEMELER.md` tüm değişiklikleri ve sınırları açıklar. `ekranlar` klasörü telefon genişliğindeki uygulama önizlemesinden alınan görüntüleri içerir; fiziksel cihaz ekran görüntüsü değildir.

## Doğrulama

Mobil TypeScript/lint, 37 depolama kontrolü, 20 sosyal özellik API kontrolü, sunucu üretim derlemesi, iOS JavaScript derlemesi ve Android APK derlemesi geçti. Android APK imzası doğrulandı. Fiziksel cihazda paylaşım penceresi, fotoğraf seçimi ve iOS cam efektinin ayrıca kontrolü gerekir.

Kaynak pakette kullanıcı veritabanı, hesap şifreleri, yerel bağımlılıklar, özgün ses kaydı ve derleme önbellekleri yoktur.
