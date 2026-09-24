# Araştırma: Partiful ve benzerleri, Çin uygulamaları, uygulanan öneriler

Yöntem: Yalnızca resmî kaynaklar (şirketin yardım merkezi, özellik sayfası, uygulama mağazası sayfası) ve resmî istatistik kullanıldı. Kaynağı olmayan başarı iddiası yazılmadı. "Gözlem" = kaynakta yazan; "Çıkarım" = bizim yorumumuz.

Araştırma tarihi: 24 Eylül 2026.

## 1. Kaynaklar

| # | Kaynak | Ne söylüyor (gözlem) |
|---|---|---|
| K1 | [Partiful — Event Settings](https://help.partiful.com/hc/en-us/articles/28895223149979-What-features-are-available-to-change-in-my-Event-Settings) | Ortak ev sahibi, +1 sınırı, davetli listesini gizleme / sayıyı gizleme, davetliden bilgi toplama, fotoğraf yükleme, otomatik hatırlatmaları görme/kapatma, parola ile erişim. |
| K2 | [Partiful — Kişi sınırı](https://help.partiful.com/hc/en-us/articles/26503173407899-How-can-I-limit-group-size) | Maksimum kapasite ve otomatik bekleme listesi; yer açılınca sıradaki kişi ekleniyor ve bildirim alıyor. |
| K3 | [Partiful — Fotoğraf yükleme](https://help.partiful.com/hc/en-us/articles/26984026098459-How-do-I-upload-photos-to-my-event-page) | Davetli ve ev sahibi etkinlik sayfasına fotoğraf yükleyebiliyor; ev sahibi kapatabiliyor. |
| K4 | [Partiful — Yanıt vermeyenlere mesaj](https://help.partiful.com/hc/en-us/articles/27427497469595-How-do-I-message-guests-who-haven-t-RSVP-d-yet) ve [e-posta ile davet edilenlere hatırlatma](https://help.partiful.com/hc/en-us/articles/34834944631707-Do-guests-invited-via-email-receive-event-reminders-and-Text-Blasts) | Ev sahibi gruba toplu mesaj ("Text Blast") atıyor; hatırlatmalar SMS/e-posta/bildirimle gidiyor. |
| K5 | [Paperless Post — Features](https://www.paperlesspost.com/features) | Ortak ev sahibi, davetli etiketleri, kapasite dolunca yanıtları kapatma, özel sorular (yemek tercihi vb.), çocuk/yetişkin sayısı, takvime ekleme, program/yol tarifi blokları. Ücret: davetli başına "coin" ya da yıllık abonelik. |
| K6 | [婚贝请柬 (Hunbei) — App Store Çin](https://apps.apple.com/cn/app/id1477291324) | Düğün/doğum/taşınma vb. için ~1000 şablon, tek dokunuşla yol tarifi, müzikli fotoğraf albümü/video, davetlinin iyi dilek bırakması, WeChat paylaşımı. Uygulama ücretsiz; uygulama içi satın alma (aylık ¥38, yıllık ¥198, ömür boyu ¥98). Mağazada 4,9 / 170 bin değerlendirme gösteriliyor. |
| K7 | Eqxiu (易企秀) şablon mağazası `store.eqxiu.com/h5` | **Doğrulanamadı:** sayfa insan doğrulamasına yönlendirdi. Astra'nın notunda kaynak olarak geçiyor ama içeriğini teyit edemedim; bu yüzden hiçbir karar buna dayanmıyor. |
| K8 | TÜİK 2025 Hanehalkı Bilişim Teknolojileri Kullanım Araştırması (haber: [Diken](https://www.diken.com.tr/turkiye-en-cok-whatsappta-internet-kullanim-orani-yuzde-909/), [AA analiz](https://www.aa.com.tr/tr/analiz/gorus-ulkelerin-sosyal-medya-karnesi-dunya-facebook-turkiye-whatsappta-basi-cekiyor/3171381)) | 16–74 yaşta internet kullanımı %90,9; en çok kullanılan uygulama WhatsApp (%88,6), sonra YouTube (%70,1) ve Instagram (%67,4). |
| K9 | [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) ve [Expo GlassEffect](https://docs.expo.dev/versions/latest/sdk/glass-effect/) (Astra'nın notundan) | Cam malzeme gezinme/kontrol katmanında; içerik okunaklı kalmalı. `isLiquidGlassAvailable` yalnızca uygun iOS sürümünde cam gösterir. |

## 2. Problem → uyarlama tablosu

Öncelik: **Y** = bu sürümde yapıldı, **O** = sıradaki sürüm, **S** = sonra / koşula bağlı.

| Kaynak | Çözdüğü problem | Buyrun uyarlaması | Maliyet | Öncelik / durum |
|---|---|---|---|---|
| K1, K4 | Davetli "ne zamandı?" diye soruyor, unutuyor | Davetli sayfasında **Takvime ekle**; dosyada **1 gün önce alarm**. Sistem mesaj göndermez, alarm davetlinin telefonunda çalışır. | Düşük (sunucuda tek yeni adres) | **Y** |
| K4 | Son dakika değişikliğini herkese duyurmak | Astra'nın **Duyurular**ı davet sayfasının en başına alındı. Ev sahibi ayrıca WhatsApp grubuna kendisi yazar. | Düşük | **Y** |
| K1 | Davetliye tarih sormak için ayrı anket uygulaması gerekiyor | Astra'nın **tarih oylaması** korundu; oy artık katılım yanıtıyla **aynı düğmeyle** kaydediliyor. | Düşük | **Y** |
| K1, K5 | Davetliden ek bilgi toplamak (şarkı, yemek tercihi) | Astra'nın **özel soruları**; yanıt yalnızca ev sahibine. | — | **Y** (korundu) |
| K6, K8 | Davet WhatsApp'ta dolaşıyor; bağlantı çirkin görünürse açılmıyor | Mobil davet bağlantısına **kapaklı önizleme kartı** ve **WhatsApp'ta gönder** düğmesi. | Düşük | **Y** |
| K6 | Salona nasıl gidilir? | Davetli sayfasında (web ve mobil davetler) "Yol tarifi al" + Yandex, Apple Haritalar, Waze bağlantıları zaten var. | — | **Y** (mevcut) |
| K5 | Çocuk/yetişkin ayrımı (sünnet, doğum günü) | Şimdilik "kaç kişi" + not. Ayrı sayaç, veritabanına sütun eklemeyi gerektirir (ekleme türü, güvenli). | Düşük–orta | **O** |
| K2, K5 | Kontenjan dolunca ne olacak? | Kontenjan bilgisi zaten var. **Otomatik kapanma** ve **bekleme listesi** aşağıda ayrıca değerlendirildi. | Orta–yüksek | **S** |
| K1, K5 | Organizasyonu iki kişi yürütüyor (gelin–damat, anne–baba) | **Ortak ev sahibi** aşağıda değerlendirildi. | Orta | **O** |
| K3, K6 | Etkinlik sonrası fotoğraflar dağınık | **Ortak albüm** aşağıda değerlendirildi. | Yüksek | **S** |
| K6 | Çok sayıda şablon ve kategori | Astra'nın 74 tasarım / 17 kategori kataloğu korundu; arama, filtre, favori var. | — | **Y** (korundu) |
| K1 | Davetli listesini herkese göstermek "sosyal kanıt" sağlıyor | **Uygulanmadı.** Türkiye'de aile davetlerinde misafir listesinin açılması gizlilik sorunu; kural: yanıtlar yalnızca ev sahibine. | — | Bilinçli olarak reddedildi |
| K1 | Davetliden para toplama ("Chip In") | **Uygulanmadı.** Ürün kuralı: davetliden para istenmez. | — | Bilinçli olarak reddedildi |

## 3. Çin uygulamalarından çıkan ilkeler (kanıta dayalı)

Başarı iddiası yapılmıyor; yalnızca mağaza sayfasında (K6) görülen özelliklerden ilke çıkarılıyor:

1. **Vesileye göre şablon bolluğu** (gözlem: ~1000 şablon, düğün/doğum/taşınma kategorileri). → Buyrun'da 17 kategori; Türk vesileleri (kına, sünnet, asker uğurlaması, mevlid, hac uğurlaması, diş buğdayı, iftar) kategori olarak var. **Çıkarım:** Şablon sayısından çok, vesileye uygun ilk 3 önerinin doğru olması önemli; sihirbaz bunu yapıyor.
2. **Paylaşım yerel mesajlaşma uygulamasına göre tasarlanmış** (gözlem: WeChat/QQ paylaşımı). → Türkiye karşılığı WhatsApp (K8). Uygulandı: WhatsApp düğmesi + önizleme kartı.
3. **Yol tarifi tek dokunuş** (gözlem). → Davetli sayfasında var (Google, Yandex, Apple Haritalar, Waze).
4. **Tek seferlik / süreli ücret** (gözlem: aylık, yıllık, ömür boyu). → Buyrun'un tek seferlik ₺49,99 modeli bununla uyumlu; abonelik önerilmiyor çünkü davet sıklığı düşük (**çıkarım**, doğrulanmadı).
5. **Davetlinin iyi dilek bırakması** (gözlem). → Buyrun'da "Ev sahibine not" alanı bu işi görüyor; herkese açık dilek duvarı gizlilik kuralı nedeniyle yok.

## 4. Büyük özelliklerin değerlendirmesi

| Özellik | Ne gerekir (bağımlılık) | Risk | Karar |
|---|---|---|---|
| **Hatırlatma** | Sunucu tarafı gönderim için SMS/e-posta sağlayıcı + telefon/e-posta toplama → iki ürün kuralını bozar. Takvim alarmı ile kural bozulmadan çözülüyor. | Yok (takvim yolu) | **Yapıldı** (takvim alarmı, 1 gün önce). Sunucudan gönderim yapılmayacak. |
| **Kontenjan** | `capacity` alanı zaten var; ev sahibi görüyor. Otomatik kapanma için davetli yanıt yolunda sayım + "yer kalmadı" durumu. | Düşük | **Sıradaki sürüm.** Veritabanı değişikliği gerektirmez. |
| **Bekleme listesi** | Yanıt durumu şu an `pending / going / maybe / declined` ile sınırlı (`mobile_guests` tablosundaki CHECK kısıtı). "Bekliyor" durumu için kısıtın değiştirilmesi gerekir → **onay gerekir**. Yer açıldığında davetliye haber vermek mesaj göndermeyi gerektirir → kuralla çelişir; davetlinin sayfayı tekrar açması gerekir. | Orta | **Sonra.** Önce kontenjan kapanması; bekleme listesi ancak ürün sahibi onaylarsa. |
| **Ortak ev sahibi** | Yönetim bağlantısının ikinci bir kişiye güvenli verilmesi: ayrı yetki anahtarı, geri alma, cihazda saklama. Yeni tablo (ekleme türü). | Orta (yetki hatası = veri sızıntısı) | **Sıradaki sürüm**, güvenlik testleriyle. Geçici çözüm: yönetim kodunu paylaşmak (mevcut). |
| **Ortak albüm** | Dosya depolama (Vercel Blob vb. hesap ve ücret), boyut/tür sınırı, uygunsuz içerik bildirimi, 90 günde silme, depolama maliyeti. | Yüksek (maliyet + içerik denetimi) | **Sonra.** Altyapı ve bütçe onayı olmadan yapılmaz. |

## 5. Bu sürümde uygulanan öneriler (özet)
1. Katılım + oylama + sorular tek formda, tek düğmeyle.
2. Duyurular davetin en başında.
3. Davetli için takvim dosyası ve 1 gün önce hatırlatma.
4. WhatsApp'ta gönder düğmesi ve davete özel bağlantı önizleme kartı.
5. Paylaşım, etkinlik ekranında en üstte.
