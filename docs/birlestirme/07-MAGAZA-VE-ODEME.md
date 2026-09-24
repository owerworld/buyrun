# Mağazaya çıkış ve ödeme: yol haritası

Araştırma tarihi: 24 Eylül 2026. Kaynaklar belgenin sonunda. Kaynağı olmayan her şey "öneri" olarak işaretli.

## 1. Özet: senin yapman gerekenler, benim yapacaklarım

| # | Adım | Kim | Maliyet | Süre |
|---|---|---|---|---|
| 1 | Google Play geliştirici hesabı aç | **Sen** (kimlik doğrulama sana ait) | 25 USD, tek sefer [K1] | 1–3 gün doğrulama |
| 2 | Apple Developer Program'a katıl | **Sen** | 99 USD/yıl [K1] | 1–2 gün |
| 3 | Her iki mağazada "küçük işletme" düşük komisyonuna başvur | **Sen** | Komisyon %30 yerine %15 [K4][K5] | Başvuru formu |
| 4 | Gizlilik metnini avukata onaylat, veri sorumlusu ve iletişim bilgisini ekle | **Sen** + avukat | — | — |
| 5 | Mağaza metinleri, ekran görüntüleri, veri güvenliği formu cevapları | **Ben** (bu belgede hazır, §5–7) | — | Hazır |
| 6 | Android kapalı test: **en az 12 test kullanıcısı, kesintisiz 14 gün** (Kasım 2023 sonrası açılan kişisel hesaplar için zorunlu) [K2] | Sen testçileri bul, ben derlemeyi hazırlarım | — | **En az 14 gün** |
| 7 | Uygulama içi satın alma (₺49,99) + sunucuda doğrulama | **Ben** (hesaplar açılınca) | — | ~1 hafta geliştirme + test |
| 8 | iPhone derlemesi, TestFlight, Apple incelemesi | Ben derlerim, sen gönderimi onaylarsın | — | İnceleme genelde 1–3 gün (öneri, garanti değil) |

**Kısayol (öneri):** Google Play hesabını **kişisel değil kurum (organization) hesabı** olarak açarsan 12 test kullanıcısı / 14 gün şartı uygulanmaz [K2]. Kurum hesabı için ücretsiz D-U-N-S numarası gerekir. Elinde bir şirket varsa bu yol 2 hafta kazandırır.

## 2. Ödeme neden uygulama içi satın alma olmak zorunda?
- Apple: Uygulama içindeki bir özelliği ya da içeriği açan ödemeler **uygulama içi satın alma (IAP)** ile alınmalı; kendi ödeme sayfana link veremezsin (ABD dışı mağazalarda) [K3].
- Google Play: Dijital ürün ve hizmet satışı Google Play Faturalandırma ile yapılır; ücret ilk 1 milyon USD için %15 [K5].
- "Davet yayını" dijital bir hizmet; bu yüzden ₺49,99 mağaza üzerinden alınır. **Net gelir (öneri, hesap):** %15 komisyonla yaklaşık ₺42,5; KDV/vergi kesintisi ayrıca düşer — kesin rakamı mali müşavirle teyit et.
- Web sitesinde ayrı bir ödeme (kart ile) mümkün ama uygulamanın içinden oraya yönlendirilemez [K3].

## 3. Ödeme tasarımı (hesaplar açılınca yapılacak)

**Ürün:** tek tip, tüketilebilir (consumable) ürün: `davet_yayini` — ₺49,99. App Store'da TRY fiyatları sabit fiyat noktalarından seçilir [K6]; ₺49,99 noktasının varlığını App Store Connect'te fiyat seçerken teyit et. Google Play'de fiyat serbestçe TRY olarak girilir.

**Akış (kural: ödeme doğrulanmadan davet yayına girmez, ödeme alınamadıysa kullanıcı emeğini kaybetmez):**
1. Kullanıcı daveti hazırlar → taslak cihazda ve sunucuda "yayında değil" olarak durur (davetli bağlantısı "yakında" gösterir).
2. Son adımda "₺49,99 ile yayınla" → mağazanın kendi ödeme ekranı.
3. Başarılı → makbuz sunucuya gider → sunucu mağazadan **doğrular** → davet yayına girer, ürün tüketildi olarak işaretlenir.
4. İptal → taslak korunur, "Ödeme yapılmadı, davetin taslak olarak duruyor" mesajı.
5. Hata / bağlantı kopması → bekleyen satın alma uygulama açılışında tekrar denenir; aynı makbuz iki kez kullanılamaz.
6. İade → mağaza bildirimiyle davet yeniden "yayında değil" yapılmaz (davetliler mağdur olmasın); yalnızca kayıt tutulur. **Bu bir ürün kararı; onayın gerekir.**

**Veritabanı:** yalnızca ekleme türü değişiklik: `mobile_events.published_at` (eski kayıtlar için varsayılan: oluşturulma tarihi → hepsi yayında kalır) ve `purchases` tablosu (makbuz kimliği benzersiz). Eski davetler ve bağlantılar etkilenmez.

**Altyapı seçimi (öneri):** 
- **RevenueCat** (react-native-purchases): sunucu doğrulaması, iade bildirimleri ve iki mağazayı tek yerden yönetir; Expo'nun resmî rehberinde önerilen seçeneklerden [K7][K8]. Belirli bir gelirin altında ücretsiz başlar (güncel planı RevenueCat sitesinde teyit et). Dışarıya satın alma verisi gönderir; gizlilik metnine eklenmeli.
- **expo-iap**: ücretsiz, açık kaynak; ama makbuz doğrulamasını kendi sunucumuzda yazmamız gerekir [K7].
- Önerim: **ilk sürüm için RevenueCat** — daha az hata riski, daha hızlı. Karar senin.

## 4. Bu sürümde mağaza için hazırlananlar
- Uygulama kimliği: `app.buyrun.mobile` (Android ve iOS), sürüm 1.2.0.
- `eas.json` → `production` profili hazır (Android için mağaza paketi AAB üretir, sürüm numarası otomatik artar).
- Gizlilik metni gerçeğe uygun hale getirildi (kapak fotoğrafı, oylama/sorular, cihazda saklama, üçüncü taraflar, "Daveti sil"). **Avukat onayı ve iletişim bilgisi eksik.**
- Kullanıcının verisini silebilmesi: "Daveti sil" eklendi (mağaza veri formlarında sorulur).
- Hesap yok → Apple'ın "hesap silme" şartı uygulanmaz (hesap oluşturma yok).

## 5. Mağaza metni (Türkçe, kopyala-yapıştır)

**Uygulama adı:** Buyrun: Davetiye ve LCV

**Kısa açıklama (80 karakter):** Davetiyeni hazırla, WhatsApp'tan gönder, kimin geleceğini tek bakışta gör.

**Uzun açıklama:**
> Doğum gününden kına gecesine, sünnetten mezuniyete… Buyrun ile birkaç dokunuşta şık bir davetiye hazırla, sevdiklerine gönder ve katılımı kolayca takip et.
>
> • 74 tasarım, 17 vesile: kına, sünnet, mevlid, diş buğdayı, asker ve hac uğurlaması, iftar, doğum günü, düğün ve daha fazlası
> • Davetlilerin uygulama indirmeden, üye olmadan, bağlantıdan yanıt verir
> • Kim geliyor, kaç kişi, kim yanıt vermedi: tek ekranda
> • Tarih oylaması, davetliye sorular ve duyurular
> • WhatsApp'ta gönder, QR'lı görsel paylaş, takvime ekle (bir gün önce hatırlatır)
> • Listeni topluca yapıştır, herkese özel bağlantı hazırlansın
>
> Gizliliğe saygılı: telefon numarası istemiyoruz, reklam ve izleme yok. Cevapları yalnızca sen görürsün. Davet bilgileri etkinlikten 90 gün sonra silinir; istersen hemen silebilirsin.
>
> Yayın ücreti: davet başına tek seferlik ₺49,99. Abonelik yok.

**Kategori:** Yaşam tarzı (Lifestyle) — alternatif: Etkinlikler (Events).
**Yaş sınırı:** Herkes / 4+ (kullanıcılar arası sohbet yok, içerik yok).

## 6. Veri güvenliği formu cevapları (Google Play) / Gizlilik etiketi (Apple)
| Soru | Cevap |
|---|---|
| Veri toplanıyor mu? | Evet |
| Toplanan veri türleri | Ad (davetli ve ev sahibi adı), kullanıcı içeriği (etkinlik bilgileri, not, soru cevapları), fotoğraf (isteğe bağlı kapak) |
| Konum, telefon, e-posta, kişiler, reklam kimliği | Hayır |
| Veri üçüncü taraflarla paylaşılıyor mu? | Hayır (barındırma ve metin üretimi "hizmet sağlayıcı" sayılır; satış/reklam yok) |
| İzleme (tracking) | Hayır |
| Veri aktarımda şifreli mi? | Evet (HTTPS) |
| Kullanıcı verisini silebilir mi? | Evet — "Daveti sil"; ayrıca 90 günde otomatik silme |
| Ödeme eklenince | Satın alma geçmişi (mağaza + RevenueCat seçilirse) eklenecek |

## 7. Ekran görüntüleri
Mağaza için 6 görüntü önerisi (telefon, dikey): 1) Ana ekran, 2) Tasarım stüdyosu, 3) Önizle ve oluştur (fiyatlı), 4) Davetiye + paylaş/WhatsApp, 5) Özet ekranı, 6) Davetlinin gördüğü sayfa. Güncel görüntüler teslim paketindeki `ekran-goruntuleri/sonra-birlesik` klasöründe; mağaza boyutuna (1080×1920 ve iPhone 6.9") göre son hâlini hesaplar açılınca üretirim.

## Kaynaklar
- [K1] Ücretler: [Google Play kayıt ücreti 25 USD](https://afkarsoftware.com/en/blog-detail/google-play-console-account-2026-one-time-25-fee/), [Apple Developer 99 USD/yıl](https://magora-systems.com/apple-developer-fee/)
- [K2] [Google Play Console Yardım — Yeni kişisel geliştirici hesapları için test şartları](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [K3] [Apple — App Store Review Guidelines güncellemesi](https://developer.apple.com/news/?id=3ozbk628), [3.1.1 özeti](https://nextnative.dev/blog/app-store-review-guidelines)
- [K4] [Apple — App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- [K5] [Google Play Console Yardım — Hizmet ücreti değişiklikleri](https://support.google.com/googleplay/android-developer/answer/10632485?hl=en)
- [K6] [App Store fiyat noktaları](https://www.mirava.io/blog/apple-app-store-price-tiers-how-they-work-2026)
- [K7] [Expo — Using in-app purchases](https://docs.expo.dev/guides/in-app-purchases/)
- [K8] [RevenueCat — Expo kurulumu](https://www.revenuecat.com/docs/getting-started/installation/expo)
