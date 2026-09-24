# Buyrun mobil uygulama · 24 Eylül 2026

## Teslim kapsamı

Expo / React Native mobil uygulaması korunmuştur. Android ve iOS aynı uygulama kodunu kullanır. Next.js kısmı, mobil uygulamanın sunucusu ve misafirlerin uygulama indirmeden yanıt verdiği davet sayfasıdır.

Ses kaydı bilgisayarda yerel olarak çözümlendi. Kayıtta öne çıkan yönler: Liquid Glass, düğün dışındaki davet türleri, Çin'deki davetiye uygulamalarının incelenmesi, kadınlar ve öğrenciler için anlaşılır kullanım, davet tamamlandıktan sonra ödeme. Kullanıcının seçtiği fiyat: davet başına **₺49,99 tek seferlik**.

## Uygulananlar

- Yeni ana ekran; davet türü kısayolları ve tasarım önerileri.
- Cam görünümünde sekme çubuğu. Uygun iOS sürümlerinde yerel Liquid Glass; diğer cihazlarda okunaklı alternatif. Sistem şeffaflığı azaltma tercihi desteklenir.
- 74 kapak: 24 özgün çizim, mevcut projenin 47 fotoğrafı ve önceki 3 görsel. 17 kategori; arama, tür filtresi, favoriler, büyük önizleme.
- Yerel paketlenmiş görseller ve yazı tipleri; galeri için dış görsel servisi gerekmez.
- Akşam yemeği, doğum günü, düğün, kına, mezuniyet, ev partisi, buluşma, baby shower, cinsiyet partisi, sünnet, diş buğdayı, mevlid, iftar, asker uğurlaması/dönüş ve hac uğurlaması.
- Sihirbazın cevaplarına uygun yeni kapak önerileri. Kendi fotoğrafını yükleme ve cihazda taslak saklama korunur.
- Tasarım → ayrıntılar → önizleme → son adım. Fiyat son adımda görünür. **Test sürümünde gerçek ödeme alınmaz.**
- Davet içinde dört sekme: Davetiye, Davetliler, Özet, Planla.
- Planla: çok seçenekli tarih oylaması, oylamayı kapatma/açma, en fazla 3 özel soru, duyurular, cihazda saklanan hazırlık listesi.
- Oylama sonuç grafikleri; mevcut gerçek katılım sayılarına dayalı özet grafikleri korunur.
- Mobilde davetiye görseli + QR paylaşımı; takvim için ICS dışa aktarma. ICS etkinlik süresi varsayılan 2 saattir; saatler Türkiye saatine göre hazırlanır.
- Misafirler aynı bağlantıdan RSVP, oylama ve soru yanıtlarını güncelleyebilir. Soru yanıtları diğer misafirlere açılmaz.
- Sunucuda doğrulama, kişiye özel erişim, oy tekrarlarını tekilleştirme, başka davete ait anahtarları reddetme ve eşzamanlı düzenleme koruması.

## Araştırmadan alınan kararlar

[Partiful](https://partiful.com/) özel davetiye, hızlı bağlantı paylaşımı, misafir soruları, tarih oylaması ve ev sahibi duyuruları için incelendi. Görselleri ve marka varlıkları kopyalanmadı.

[Partiful gizlilik yaklaşımı](https://help.partiful.com/en-us/articles/15525648-how-does-partiful-protect-my-data) doğrultusunda açık misafir listesi eklenmedi; yanıtların gizliliği korundu.

[Hunbei'nin App Store sayfası](https://apps.apple.com/cn/app/id1477291324) ve [Eqxiu'nun kendi davetiye kataloğu](https://store.eqxiu.com/h5/) incelendi: kategori zenginliği, görsel önizleme ve az adımlı kişiselleştirme uygulandı. Yanıltıcı değerlendirme, sahte sayaç veya baskıcı satış akışı kullanılmadı.

[Apple materyal rehberi](https://developer.apple.com/design/human-interface-guidelines/materials) doğrultusunda cam efekti kontrollere ayrıldı; davet içerikleri camın içine yerleştirilmedi. [Expo GlassEffect](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/) ile cihaz uyumluluğu kontrol edilir.

## Ödeme ve yayın sınırı

₺49,99 ürün kararı arayüze işlendi. Mağaza ürünü, satın alma çağrısı, makbuz doğrulama veya tahsilat bu yerel pakette etkin değildir. Gerçek ödeme için Apple/Google ürünlerinin kurulması ve sunucuda makbuz doğrulaması gerekir. [Apple uygulama inceleme kuralları](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase).

Kullanıcı hesap girişlerini daha sonra yapmak istediği için GitHub/Vercel/Expo'ya yayın yapılmadı. iOS için imzalı IPA/TestFlight üretilmedi; iOS kaynak projesi ve JavaScript derlemesi hazırlandı. Android paketi yerel test içindir; mağaza yayını için imzalanmış bir üretim sürümü değildir.

Ortak fotoğraf albümü, ücretli bilet, ortak ev sahibi, otomatik SMS/push ve bekleme listesi bu sürüme eklenmedi. Duyurular davet sayfasında görünür; kendiliğinden mesaj göndermez.

## Yerel kullanım

Sunucu: bilgisayarın aynı Wi-Fi üzerindeki adresi, port 3001. Bu bilgisayarda kullanılan adres: `http://192.168.1.170:3001`.

- Android APK ARM64 cihazlar içindir. Görseller/galeri çevrimdışı açılır; yeni davet ve güncel yanıtlar için sunucu gerekir.
- Proje kökündeki `scripts/start-local.command` sunucuyu başlatır. Node.js 22+ gereklidir.
- IP değişirse `buyrun-mobile/scripts-build-local.sh` ile yeni IP kullanılarak yeniden derlenir. Yerel APK'deki HTTP izni yalnızca derlemede seçilen özel IP ile sınırlıdır; üretim profilleri HTTPS kullanır.
- Kayıtlar yerel sunucuda `.data/pglite` altında tutulur; paylaşım paketine kullanıcı/test veritabanı dahil edilmez.
- Kaynak paketteki `buyrun-mobile/ios/Buyrun.xcworkspace` ancak CocoaPods kurulumu sonrasında oluşur. Xcode projesi ve Podfile hazırdır; gerçek cihaz kurulumu Apple imzası gerektirir.

## Doğrulama

- Mobil TypeScript ve lint: geçti.
- 37 cihaz depolama/güvenli anahtar kontrolü: geçti.
- 20 sosyal özellik HTTP kontrolü: geçti.
- Next.js üretim derlemesi: geçti.
- iOS JavaScript/Hermes dışa aktarma ve yerel iOS proje oluşturma: geçti.
- Telefon genişliğinde galeri, favoriler, taslak geri yükleme, davet oluşturma ve oylama akışları görsel olarak denetlendi.
- Fiziksel Android/iPhone bağlı olmadığı için cihaz üstünde kamera/fotoğraf, paylaşım penceresi ve iOS Liquid Glass davranışı ayrıca test edilmelidir.

Android 1.1.0 (2), ARM64 release APK başarıyla derlendi; APK v2 imzası doğrulandı. Paket içindeki JavaScript derlemesi güncel kaynaklarla karşılaştırıldı. Bu sürüm yerel test anahtarıyla imzalıdır; mağaza anahtarı kullanılmadı.

Son tarayıcı kontrolünde misafir katılım yanıtı, oy verme, özel soru yanıtı ve sonuç sayacının güncellenmesi de doğrulandı. Yerel sunucunun geliştirme kaynaklarına yalnızca localhost ve seçilen bilgisayar adresinden erişim tanımlandı.
