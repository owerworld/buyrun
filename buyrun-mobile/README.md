# Buyrun · Mobil uygulama

Buyrun, Expo SDK 57 ve React Native ile hazırlanmış iOS/Android uygulamasıdır. Alt menü **Planlar**, **Tasarımlar**, **Oluştur** ve **Profil** bölümlerinden oluşur. Etkinlik oluşturma, hazır kapak veya galeriden fotoğraf seçme, davetli yönetimi, yanıt grafikleri ve kişisel davet bağlantıları içerir. Görünen örnek planlar “Örnek” olarak işaretlidir; gerçek planlar ayrı olarak oluşturulur ve sunucuya kaydedilir.

Bu klasör mobil istemcidir. Yanındaki `buyrun` klasörü Next.js API sunucusunu ve uygulama kurmadan yanıt verebilen davetliler için davet sayfasını içerir. Mobil uygulama bir WebView sarmalayıcısı değildir. Tarayıcı sürümü, aynı React Native ekranlarını incelemek için kullanılan önizlemedir.

## Yerelde çalıştırma

Güncel Node.js LTS ve npm gerekir. Projenin kilit dosyası korunmuştur.

API sunucusu için, `buyrun` klasöründe:

```sh
npm ci
npm run dev -- --hostname 0.0.0.0 --port 3000
```

`DATABASE_URL` verilmezse sunucu, yalnızca yerel geliştirmede `.data/pglite` altında dosyaya kaydeden PGlite kullanır. Paylaşım ve yanıt bağlantıları bu sunucu çalışırken erişilebilirdir.

Mobil proje klasöründe:

```sh
npm ci
cp .env.example .env.local
```

`.env.local` içindeki `EXPO_PUBLIC_API_URL` değerini kendi ortamına göre düzenle:

- Yalnızca aynı bilgisayarda tarayıcı testi: `http://127.0.0.1:3000`
- Aynı Wi-Fi üzerindeki gerçek telefon: bilgisayarının yerel IP adresiyle `http://BILGISAYARIN-YEREL-IP-ADRESI:3000`
- Dağıtılacak APK veya mağaza sürümü: internete açık, geçerli sertifikalı `https://api.ornek-alan-adin.com`

Telefonun `localhost` adresi bilgisayarını göstermez. Yerel IP değişirse `.env.local` dosyasını güncelle ve Expo’yu yeniden başlat. Kaynak kodda kişisel yerel IP adresi bulunmaz; yalnızca geliştirme modunda varsayılan adres `127.0.0.1:3000` olur.

```sh
npm start
```

Tarayıcıda tasarım ve akış önizlemesi:

```sh
npm run web
```

Uygun Android ortamı veya iOS simülatörü hazır olduğunda:

```sh
npm run android
npm run ios
```

`npm run ios` için macOS üzerinde Xcode ve iOS Simulator; Android emülatörü için Android SDK gerekir. Bu çalışma bilgisayarında bu araçlar bulunmadığı için kurulu native uygulama testi yapılmadı.

## iPhone ve Expo Go: SDK 57

22 Eylül 2026’da kontrol edilen resmi Expo belgelerine göre App Store’daki Expo Go, SDK 54’te kalır; bu SDK 57 projesi için telefondaki herhangi bir Expo Go sürümüne QR okutmak tek başına yeterli değildir. Fiziksel iPhone’da uyumlu Expo Go, `eas go` ile oluşturulup TestFlight üzerinden yüklenebilir; bu yol Apple Developer Program üyeliği gerektirir. CLI ve telefondaki Expo Go aynı Expo hesabında açık olmalıdır. [Expo sürüm uyumu](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/), [fiziksel iPhone kurulumu](https://docs.expo.dev/get-started/set-up-your-environment/?device=physical&mode=expo-go&platform=ios).

```sh
npx expo login
npx eas-cli@latest go --sdk-version 57.0.0
```

Expo Go bir geliştirme ortamıdır. Bağımsız Buyrun uygulamasının dağıtımı aşağıdaki imzalı uygulama derleme akışıyla yapılır. Android cihaz/emülatörü ve iOS simülatörü için uygun SDK sürümü [Expo’nun indirme sayfasından](https://expo.dev/go) seçilebilir.

## Android APK ve mağaza derlemesi

`eas.json` içindeki `preview` profili doğrudan Android’e yüklenebilen APK üretir. `production` profili mağaza dağıtımı içindir. Bu çalışma sırasında EAS oturumu açık değildi; APK/IPA oluşturulmadı, imzalama hesabı bağlanmadı ve hiçbir mağazaya gönderim yapılmadı.

Önce Expo hesabınla giriş yap, projeyi kendi hesabına bağla ve sunucunun HTTPS adresini EAS ortamında tanımla:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:set --name EXPO_PUBLIC_API_URL --value https://api.ornek-alan-adin.com --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_API_URL --value https://api.ornek-alan-adin.com --environment production --visibility plaintext
npx eas-cli@latest build --platform android --profile preview
```

İlk Android derlemesinde EAS bir imzalama anahtarı oluşturabilir veya mevcut anahtarını kullanabilirsin. Mevcut yayımlanmış uygulaman varsa aynı imzalama kimliğini koru. APK derlemesi için Expo hesabı ve Android imzalama anahtarı gerekir; APK’yı doğrudan telefona yüklemek Play Store’a gönderim değildir. [APK profili](https://docs.expo.dev/build-reference/apk/), [EAS imzalama ve derleme](https://docs.expo.dev/build).

Mağaza sürümü için:

```sh
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

Google Play’e dağıtım için Google Play geliştirici hesabı; iOS imzalama, TestFlight ve App Store için Apple Developer üyeliği ve uygun sertifikalar gerekir. `app.json` içindeki `app.buyrun.mobile` paket/bundle kimliklerini kendi hesaplarında kullanabileceğini doğrula. Derleme yapmak mağazaya otomatik gönderim değildir. [Mağaza derleme gereksinimleri](https://docs.expo.dev/deploy/build-project/).

**Dağıtılabilir tüm sürümlerde**, APK önizlemesi dahil, `EXPO_PUBLIC_API_URL` zorunludur ve HTTPS olmalıdır. Eksik veya HTTP adresinde uygulama açıklayıcı hata gösterir ve istek göndermez. Geliştirme için kullanılan `.env.local`, kaynak paketine ve EAS kaynak yüklemesine dahil edilmez; EAS ortam değişkenleri ayrıca ayarlanmalıdır. `EXPO_PUBLIC_` değerleri uygulama paketinden okunabilir; buraya veritabanı parolası, yönetim anahtarı veya başka bir sır yazma. [EAS ortam değişkenleri](https://docs.expo.dev/eas/environment-variables/manage/).

## API sunucusunu üretime hazırlama

`buyrun` klasörünü HTTPS destekleyen bir Node.js/Next.js sunucusuna yayımla. Üretim sunucusunda aşağıdaki değerleri ayarla:

- `DATABASE_URL`: kalıcı PostgreSQL bağlantısı; yalnızca sunucuda tutulur.
- `CRON_SECRET`: temizleme uç noktasını koruyan güçlü, rastgele sunucu anahtarı.
- `NEXT_PUBLIC_SITE_URL`: sunucunun herkese açık HTTPS adresi.

API’nin, `/m/...` davet sayfalarının ve `/mobile-covers/...` görsellerinin aynı yayında erişilebilir olması gerekir. Sunucu gelen isteğin gerçek `Host` bilgisini kullanarak paylaşım bağlantısı üretir. Ters vekil kullanılıyorsa herkese açık alan adı korunmalıdır. Yerel PGlite dizinini üretim veritabanı veya paylaşımlı çoklu sunucu depolaması olarak kullanma.

Mobil API, mevcut düğün/aile kayıtlarından ayrı `mobile_events` ve `mobile_guests` tablolarını açar. Yönetim kodları etkinliğe erişim yetkisi verir; kullanıcı adı/parola hesabı yoktur. Telefon değiştirdiğinde, önceden sakladığın yönetim kodunu Profil’den içe aktarabilirsin. Yönetim kodu kaybolursa hesapsız akışta geri alma imkânı yoktur. Yönetim kodunu davetlilerle paylaşma; davet paylaşım bağlantısını kullan.

| Uç nokta | Amaç |
| --- | --- |
| `POST /api/mobile/events` | Etkinlik oluşturur; yönetim kodu ve davet bağlantısı döndürür. |
| `GET /api/mobile/events/[manageToken]` | Etkinliği ve yalnızca o etkinliğin davetlilerini getirir. |
| `PATCH /api/mobile/events/[manageToken]` | Etkinlik bilgilerini veya kapağını düzenler. |
| `POST /api/mobile/events/[manageToken]/guests` | Davetli ekler; kişiye özel yanıt bağlantısı üretir. |
| `PATCH /api/mobile/events/[manageToken]/guests/[guestId]` | Ev sahibinin kaydettiği katılım yanıtını günceller. |
| `GET /api/mobile/invites/[inviteToken]` | Genel davet bilgilerini getirir; davetli listesini veya yönetim kodunu döndürmez. |
| `POST /api/mobile/invites/[inviteToken]` | Davetlinin yanıtını kaydeder; kişisel token ile mevcut yanıtı günceller. |
| `/m/[inviteToken]` | Uygulama kurmadan yanıt verilebilen davet sayfasıdır. |

Davetli durumları `pending`, `going`, `maybe`, `declined` değerlerini kullanır. `count`, kişinin kendisi dahil 1–20 kişilik katılım sayısıdır. Etkinlik kapasitesi planlama hedefidir; koltuk rezervasyonu veya ödeme işlemi yoktur. Görseller JPEG/PNG/WebP olarak doğrulanır, yaklaşık 2 MB’a sınırlandırılır ve API isteğinin boyutu ayrıca sınırlandırılır. Otomatik mesaj, SMS veya e-posta gönderilmez.

## Veri saklama ve temizleme

Sunucu `deleteAfter` tarihini etkinlik tarihinden 90 gün sonrası olarak hesaplar. Bu tarih geçince API etkinliği erişime kapatır. Fiziksel silme, korumalı `GET /api/cron/cleanup` çağrısında gerçekleşir; etkinlikle bağlantılı mobil davetliler de silinir.

`buyrun/vercel.json` günlük `03:00 UTC` temizleme zamanlamasını içerir. Vercel’de cron etkinleştirilmeli ve `CRON_SECRET` tanımlanmalıdır. Başka bir sunucuda aynı günlük görev, `Authorization: Bearer <CRON_SECRET>` başlığıyla bu uç noktayı çağıracak şekilde kurulmalıdır. Yerel geliştirme sunucusu kendi başına zamanlanmış temizlik çalıştırmaz.

Native cihazda yönetim anahtarları etkinlik başına SecureStore’da tutulur. Eski tek JSON anahtar kaydı, ilk yüklemede kayıp olmadan dönüştürülür. Davetli token’ları ve kişisel yanıt URL’leri normal önbelleğe yazılmaz; sunucudan yeniden alınır. Süresi dolan veya sunucunun 404 ile kaldırıldığını bildirdiği planlar cihazdan da temizlenir. Uygulama açılışı, tekrar öne gelmesi ve saatlik kontrol yerel sona erme tarihini denetler. Çevrimdışı kalınca son kayıt gösterilir ve güncellemenin alınamadığı belirtilir. Tarayıcı önizlemesi SecureStore kullanmaz; tarayıcının yerel depolamasına dayanır.

## Kontrol edilenler ve kalan cihaz doğrulaması

Bu çalışma sırasında tamamlanan kontroller:

- TypeScript ve kod kalite kontrolü.
- Web, iOS ve Android için Expo JavaScript/varlık dışa aktarımı.
- Gerçek yerel API’ye yönelik 55 kontrol: kayıt, düzenleme, yanıt güncelleme, etkinlikler arası yetki ayrımı, genel davette gizlilik, tarih/görsel doğrulama, istek boyutu sınırı ve CORS.
- 37 depolama kontrolü: 120 etkinlikte anahtar dönüşümü, dönüşüm hatasında eski anahtarların korunması, gizli yanıt bağlantılarının önbellekten çıkarılması, başlangıçta kayıtların ezilmemesi, 404/sona erme ve çevrimdışı davranış.
- Aynı yerel ağ üzerinden API/davet/görsel erişimi; tarayıcıda gerçek yanıt kaydı ve telefon boyutunda görsel inceleme.

**Expo dışa aktarımı APK/IPA derlemesi veya telefona kurulum değildir.** İmzalı native uygulamada galeri izni, güvenli depolama, paylaşım ekranı, geri hareketi, klavye ve fiziksel cihaz ağ bağlantısı henüz denenmedi. Bu doğrulamalar Android APK/iOS TestFlight kurulumu sonrasında yapılmalıdır. Canlı siteye veya uygulama mağazasına yayımlama yapılmadı.

Kontrolleri yeniden çalıştırmak için:

```sh
npm run typecheck
npm run lint
npm run test:storage
npx expo export --platform all
```

## Kaynak paketinin içeriği

Paket kaynak kodu, kapak görsellerini, fontları, `package-lock.json`, `.env.example` ve `eas.json` dosyalarını içerir. `npm ci` bağımlılıkları yeniden kurar. Yerel `.env` dosyaları, veritabanı, yönetim kodları, cihaz önbelleği, imzalama dosyaları, bağımlılık klasörleri ve geçici test çıktıları kaynak paketine alınmamalıdır. API sunucusunun `.env.example` dosyası korunur; gerçek `DATABASE_URL` ve `CRON_SECRET` yalnızca sunucunun ortamında bulunmalıdır.
