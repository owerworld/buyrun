# Değişiklik listesi ve durum

## A. Değişiklik listesi (Astra Final → birleşik sürüm)

### Davetli sayfası (web, `app/m/[token]/`)
1. **Tek form, tek düğme:** Tarih oylaması ve özel sorular katılım formunun içine taşındı. "Yanıtımı gönder" hem katılımı hem oyları/yanıtları kaydeder. Katılım kaydedilir de seçimler kaydedilemezse davetliye açıkça söylenir ("Katılım yanıtın kaydedildi; seçimlerini tekrar gönderebilirsin").
2. **Duyurular en üstte:** "Ev sahibinden haberler" kutusu kapağın hemen altında, en yenisi üstte.
3. **Takvime ekle:** Tarih satırında bağlantı; yeni adres `/m/<davet>/takvim`. Dosyada 3 saatlik etkinlik ve **1 gün önce hatırlatma**.
4. **Bağlantı önizleme kartı:** `/m/<davet>/opengraph-image` — kapak görseli + kategori + başlık + tarih/saat + yer. Sayfa başlığı ve açıklaması davete özel. Arama motorlarına kapalılık korunuyor.
5. Oyu/yanıtı değiştirince "kaydedildi" durumu sıfırlanıyor (davetli yeniden göndermesi gerektiğini görür).

### Sunucu (`lib/`)
6. `lib/ics.ts`: takvim metninde `;` karakterinin yanlış kaçırılması düzeltildi; tüm takvim dosyalarına 1 gün önce hatırlatma eklendi; mobil davetler için `buildEventIcs`.
7. `lib/og.tsx`: mobil davet önizleme kartı (`eventPoster`), kapak dosyası için güvenli (izin listeli) okuma.

### Web sihirbazı
8. `app/basla/bilgiler`: son adımda "Yayın fiyatı davet başına tek seferlik ₺49,99. Bu test sürümünde ödeme alınmaz."

### Mobil uygulama (`buyrun-mobile/`)
9. Etkinlik ekranı: paylaşım bloğu en üstte; **WhatsApp'ta gönder** düğmesi; Davetiye dışındaki sekmelerde büyük kapak yerine küçük özet satırı (dokununca Davetiye sekmesine döner).
10. Sekme çubuğu: 320 px ekranda "Davetiye / Davetliler (sayı) / Özet / Planla" artık üst üste binmiyor; büyük yazı tipinde en fazla 1,3 kat büyür.
11. Planla: Oylama / Sorular / Duyurular / Hazırlık düğmeleri 2×2.
12. Kapak yazıları: 13 illüstrasyon için yazı alanı tanımlandı; yazı çizimin boş kısmına yerleşiyor, uzun başlıkta küçülüyor.
13. Takvim paylaşımı (ev sahibi): 1 gün önce hatırlatma eklendi.
14. Sürüm 1.2.0 (Astra'nın 1.1.0 yerel APK'sından ayırt etmek için).

### Belgeler
15. `docs/birlestirme/` altındaki 7 belge.

Veritabanı: **yeni tablo veya sütun yok.** Astra'nın eklediği iki tablo zaten `CREATE TABLE IF NOT EXISTS`.

## B. Durum

### Yapıldı ve test edildi
| Ne | Nasıl test edildi |
|---|---|
| Sunucu derlemesi | `next build` başarılı; `next start` (üretim modu) ile tüm sayfalar 200 |
| Tür denetimi | Web ve mobil `tsc --noEmit` hatasız; mobil `expo lint` hatasız |
| Plan verileri güvenliği | `scripts/check-social.mjs` — 20 HTTP kontrolü geçti (yetki, gizli yanıtlar, çift oy, kapalı oylama) |
| Mobil cihaz depolama | `npm run test:storage` — 37 kontrol geçti |
| Davetli birleşik akışı | Playwright: katılım + oy + gizli soru tek düğmeyle kaydedildi; yanıt herkese açık uçta görünmüyor |
| Eski web davet akışı | Regresyon betiği: oluşturma, davetli ekleme, LCV, poster, takvim, hikâye, Excel, düzenleme, önizleme, süzgeç — 14/14 |
| Mobil akış (web önizlemesi) | 390 px ve 320 px'te: sihirbaz → önizleme → son adım (fiyat) → etkinlik → 4 sekme; sayfa hatası yok |
| Önizleme kartı ve takvim dosyası | Görüntü 1200×630 üretildi; .ics içinde VALARM ve doğru saat dilimi |

### Canlıda doğrulandı (24 Eylül 2026, commit `bd9ccf1`)
- Vercel yayını `READY` (production).
- Web sihirbazı son adımında fiyat notu görünüyor.
- İşaretli tek bir deneme davetiyle ("Canlı kontrol — silinebilir", etkinlik 1 Ekim 2026, 90 gün sonra kendiliğinden silinir): davet sayfası 200, önizleme kartı PNG olarak üretiliyor, takvim dosyası hatırlatmalı iniyor, sayfa arama motorlarına kapalı (`noindex`).

### Test edilemedi (dürüst liste)
| Ne | Neden | Nasıl test edilir |
|---|---|---|
| iOS cam efekti (Liquid Glass) | Bu ortamda iPhone/simülatör yok | iOS 26 cihazda Expo geliştirme derlemesi |
| QR'lı görsel paylaşımı ve takvim dosyası paylaşımı (mobil) | Web önizlemede desteklenmiyor; gerçek cihaz gerekli | APK'yı Android telefona kurup "Görsel & QR paylaş" |
| WhatsApp düğmesi | Gerçek telefonda WhatsApp gerekli | APK ile |
| Klavye açıkken formlar (gerçek cihaz) | Web önizleme klavyeyi taklit etmiyor | APK ile, küçük telefonda |
| Yavaş ağ | Yalnızca kodda yükleniyor/hata durumları kontrol edildi | Telefonda geliştirici seçeneklerinden ağ kısıtlama |
| Canlı önizleme kartının WhatsApp'ta görünümü | WhatsApp önbelleği ve gerçek paylaşım gerekli | Canlı yayından sonra bir davet bağlantısını kendine gönder |

### Kalan işler (öncelik sırası)
1. Gerçek cihazda yukarıdaki "test edilemedi" listesi.
2. Kontenjan dolunca yanıtların kapanması (veritabanı değişikliği gerekmez).
3. ~~Mobil davetlerde harita/yol tarifi~~ — düzeltme: davetli sayfasında zaten var.
4. Ortak ev sahibi (güvenlik testleriyle).
5. Ödeme: mağaza ürünleri, sunucu doğrulaması, iptal/hata — ürün sahibinin mağaza hesapları ve fiyat kararı gerekiyor.
6. iOS derlemesi: Apple Developer hesabı gerekiyor.
7. Bekleme listesi ve ortak albüm: ürün sahibi onayı + altyapı kararı.

## C. Kurulum dosyaları
- **Android APK 1.2.0** (EAS `preview`, commit `bd9ccf1`, canlı sunucuya bağlı, 117 MB): https://expo.dev/artifacts/eas/mmDTAozh-fvPXjHrw9c7Dyfb6yKsMcAWL-_5whSQTUE.apk — bağlantı 8 Ekim 2026'ya kadar geçerli; sonra EAS panelinden yeniden derlenir.
- **iOS:** Apple Developer hesabı olmadığı için üretilmedi.
- **Web önizleme:** https://buyrun.vercel.app/uygulama

## D. "10/10" turu (müşteri gözüyle puanlamadan sonra)
| Alan | Önce | Yapılan | Şimdi (tahmin) |
|---|---|---|---|
| Davet oluşturma akışı | 6 | Hiçbir yerde kullanılmayan "Kaç kişilik?" sorusu kaldırıldı; kapak sihirbazda/Tasarımlar'da seçildiyse kapak adımı atlanıyor; önizleme ile son adım birleşti (4 → 3 adım, sihirbazdan sonra 2 ekran). | 8,5 |
| Verinin güvende kalması | 5 | Davet oluşunca "Davetini güvenceye al" kartı: yönetim kodu tek dokunuşla kendine gönderilir/kopyalanır; geri getirirken mesajın tamamı yapıştırılabilir. "Daveti sil" eklendi. | 8,5 |
| Ev sahibinin takibi | 8 | Toplu davetli ekleme: liste yapıştırılır, her satır bir davetli; numara/madde işaretleri atılır, tekrarlar birleşir; yarıda kalırsa kalanlar kutuda kalır. | 9 |
| Tasarım | 8,5 | Fotoğraflı kapaklarda yazının arkası koyulaştırıldı, başlığa hafif gölge. | 9 |
| Gizlilik ve güven | 8,5 | "Daveti sil" (sunucudan kalıcı); gizlilik metni gerçeğe uygun hale getirildi (kapak fotoğrafı, oylama/sorular, cihazda saklama, üçüncü taraflar). | 9 (avukat onayıyla 10) |
| Tutarlılık | 5 | Ana sayfaya "Buyrun uygulaması" kartı; "uygulama indirmek yok" ifadesi "davetlileriniz uygulama indirmeden yanıt verir" olarak düzeltildi. | 7,5 |
| Ürüne ulaşabilme | 2 | Web önizleme (/uygulama) + APK; mağaza yol haritası ve metinleri hazır (07). | 4 → hesaplar açılınca 9–10 |
| Para kazanma | 1 | Ödeme tasarımı, altyapı seçimi, komisyon/ücret araştırması (07). | 2 → hesaplar açılınca 9–10 |

Düzeltme: Önceki belgede "mobil davetlerde yol tarifi yok" yazıyordu; yanlıştı. Davetli sayfasında Google, Yandex, Apple Haritalar ve Waze bağlantıları var.

Yeni otomatik test: `scripts/check-delete.mjs` (12 kontrol: yalnızca yönetim koduyla silinir, bağlı veriler silinir, başka davetler etkilenmez).
