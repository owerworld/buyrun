# Claude Final + Astra Final — karşılaştırma ve birleştirme kararları

Tarih: 24 Eylül 2026 · Dal: `claude/wizardly-meitner-5vakb6`

## Neyi karşılaştırdık?

| Sürüm | Kaynak | Git etiketi |
|---|---|---|
| **Claude Final** | Bu depodaki son Claude sürümü (commit `e408d68`) | `claude-final` |
| **Astra Final** | Yüklenen `Buyrun-Guncel-Proje.zip` (Claude Final üzerine kurulmuş) | `astra-final` (commit `6c3b998`) |
| **Birleşik sürüm** | İkisinin karşılaştırılıp düzeltilmiş hâli | dalın son commit'i |

**Eksik gelenler (açıkça belirtiyorum):**
- Mesajda sözü geçen **çizim** bana ulaşmadı. Birleştirmede çizime dayalı bir karar yoktur; çizimi gönderirsen ona göre ayrıca düzenlerim.
- `GELISTIRICIYE-DEVIR.md`, `GUNCELLEMELER.md`, `BASLA.md` ZIP'in içinde **yok**. Astra'nın notları olarak yalnızca `docs/24-EYLUL-GUNCELLEME.md` ve `docs/YEREL-PAKET.md` vardı; bunları okudum ve kodla tek tek doğruladım.
- Astra'nın notunda geçen **1.1.0 (2) APK** kendi bilgisayarında üretilmiş; ZIP'te APK yok.

"Final" adına güvenilmedi: Astra'nın notlarındaki her iddia kodda arandı. Doğrulanamayan ya da hatalı bulunanlar aşağıda "iyileştirme" sütununda.

## Bölüm bölüm karşılaştırma

| Bölüm | Claude Final | Astra Final | Korunan çözüm | Yapılan iyileştirme | Gerekçe |
|---|---|---|---|---|---|
| Uygulama yapısı | Expo (Android/iOS) + Next.js sunucu ve davetli sayfaları | Aynı yapı, sürüm 1.1.0 (versionCode 2) | Aynı yapı, Astra'nın sürüm numarası | — | Ana fikir: uygulama + bağlantıyla yanıt veren davetli. Web sitesine çevrilmedi. |
| Tasarım kataloğu | 3 kapak (cherry, midnight, bloom) + fotoğraflı sihirbaz | **74 tasarım / 17 kategori** (24 illüstrasyon + 47 fotoğraf + 3 özgün) | Astra kataloğu + Claude'un 3 özgün kapağı | Kapak yazısı artık illüstrasyonun **boş alanına** yerleşiyor (13 illüstrasyon için yazı alanı tanımlandı) | Uzun Türkçe başlıklar limon/disko topu gibi çizimlerin üstüne biniyordu. |
| Arama, filtre, favoriler | Yoktu | Arama, İllüstrasyon/Fotoğraf filtresi, "Kaydettiklerim" (cihazda) | Astra | — | Kodda ve ekranda doğrulandı. |
| Büyük önizleme, kendi fotoğrafı, taslak | Vardı | Korunmuş | Her ikisi aynı | — | — |
| Sihirbaz (vesile → sorular) | Etkinliğe özel sorular, ton örnekleri, son adım metinleri | Claude'unkini korumuş, kapak seçimini katalogdan yapıyor | Claude soruları + Astra katalog seçimi | — | Astra, Claude'un türe özel akışını bozmamış. |
| Son adım / fiyat | Fiyat yoktu | Mobil son adımda "₺49,99 · Davet başına · tek seferlik", "Bu test sürümünde ödeme alınmaz" | Astra | Aynı not **web sihirbazının son adımına** da eklendi | İki yüzde tutarlı fiyat bilgisi. Ödeme alınıyormuş gibi davranılmıyor. |
| Alt gezinme (cam / Liquid Glass) | Düz sekme çubuğu | `expo-glass-effect`; iOS 26'da cam, diğerlerinde yarı saydam; "saydamlığı azalt" ayarına uyuyor | Astra | — | Cam yalnızca gezinme/kontrollerde; içerik kartları düz kaldı (tek görsel dil). |
| Etkinlik ekranı sekmeleri | Davetiye / Davetliler / Özet | + **Planla** | Astra'nın 4 sekmesi | Paylaşım bloğu en üste alındı; **WhatsApp'ta gönder** düğmesi; diğer sekmelerde büyük kapak yerine küçük özet satırı; 320 px ekranda sekme adları artık üst üste binmiyor | Ev sahibinin 1 numaralı işi paylaşmak. Büyük kapak diğer sekmelerde içeriği ekranın altına itiyordu. |
| Grafikler (Özet) | Gelecek kişi, yanıt oranı, durum çubukları | Korunmuş | Her ikisi | — | Sahte istatistik yok; sayılar gerçek yanıtlardan. |
| Tarih oylaması, özel sorular, duyurular | Yoktu | Ev sahibi uygulamada kuruyor; davetli sayfasında **ayrı bir blok** olarak ve **ayrı kaydet düğmesiyle** | Astra'nın sunucu tarafı (tablolar, yetki, gizlilik) | Davetli sayfasında oylama ve sorular **katılım formunun içine** taşındı: tek düğme hem katılımı hem seçimleri kaydediyor. Duyurular sayfanın **başına** alındı. | Astra sürümünde davetli önce "Yanıtımı gönder", sonra ayrıca "Seçimlerimi kaydet" demek zorundaydı; ikincisini unutan davetlinin oyu kayboluyordu. |
| Özel soru gizliliği | — | Yanıtlar yalnızca ev sahibine dönüyor | Astra | Birleşik akışta tekrar test edildi (yanıt başka davetlilere dönmüyor) | Kural: "Özel soru yanıtları diğer davetlilere açılmasın." |
| Hazırlık listesi | Yoktu | Cihazda saklanan kontrol listesi | Astra | Planla düğmeleri 2×2 düzene alındı | 3+1 dağılım dar ekranda dağınık görünüyordu. |
| QR'lı görsel paylaşım | Yoktu | `react-native-view-shot` ile QR'lı görsel | Astra | — | Web önizlemede desteklenmiyor (bilinen sınır, uygulamada çalışıyor). |
| Takvime ekleme | Web davetinde vardı | Mobilde ev sahibi için .ics paylaşımı | İkisi | Mobil takvim dosyasına **1 gün önce hatırlatma** eklendi; mobil davetlerin davetli sayfasına **"Takvime ekle"** bağlantısı eklendi (yeni adres: `/m/<davet>/takvim`); takvim metnindeki `;` karakteri hatalı kaçırılıyordu, düzeltildi | Hatırlatma, sistemin kimseye mesaj göndermemesi kuralını bozmadan davetlinin kendi takviminde çalışır. |
| WhatsApp bağlantı önizlemesi | Web davetlerinde vardı | Mobil davetlerde sabit, genel başlık | — | Mobil davet bağlantısı için **davete özel önizleme kartı** (kapak + başlık + tarih + yer) ve özel başlık/açıklama | Türkiye'de davet WhatsApp'ta dolaşıyor; önizleme kartı ilk izlenim. |
| Güvenli sunucu bağlantısı | HTTPS zorunlu | Yerel test için yalnızca özel IP'ye izin veren `EXPO_PUBLIC_LOCAL_PREVIEW` | Astra | Belgelere Metro önbelleği notu eklendi (`--clear`) | Yanlış yapılandırmada test uygulaması "güvenli bağlantı ayarlanmamış" hatası veriyordu. |
| Veritabanı | Ekleme türü değişiklikler | `mobile_social`, `mobile_social_responses` tabloları (`CREATE TABLE IF NOT EXISTS`) | İkisi | Yeni tablo/sütun eklenmedi | Eski kayıtlar, davet bağlantıları ve yetkiler aynen korunuyor; silinen etkinlikle birlikte plan verileri de siliniyor (CASCADE). |
| Yazı tipleri ve görseller | Manrope, Cormorant; fotoğraflar | Aynıları + yeni illüstrasyonlar | Hepsi | — | Özgün görseller silinmedi; yenileri ek seçenek. |

## Bilinçli olarak yapılmayanlar

- **Ödeme:** Mağaza ürünü, sunucuda doğrulama ve iptal/hata durumları olmadan tahsilat eklenmedi. Fiyat yalnızca bilgi olarak gösteriliyor.
- **İzleme/analitik servisi:** Eklenmedi; dışarıya veri gönderilmiyor.
- **Otomatik SMS/WhatsApp/e-posta gönderimi:** Eklenmedi (kural: sistem kimseye mesaj göndermez). WhatsApp düğmesi yalnızca ev sahibinin kendi WhatsApp'ını açar.
- **Kontenjan dolunca bekleme listesi:** Veritabanında yanıt durumu kısıtı değiştirilmeden yapılamıyor; `03-ARASTIRMA-VE-ONERILER.md` içinde ayrıntılı değerlendirme var.
