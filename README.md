# Buyrun — Dijital davetiye ve LCV (MVP v0.1)

Kına ve düğün tek linkte. Üyeliksiz LCV, iki aile paneli, otomatik veri silme.

## Ne çalışıyor
- `/olustur` — Çift davetiyeyi oluşturur (düğün + isteğe bağlı kına, servis, program, tema)
- `/yonet/[token]` — Çiftin yönetim sayfası: iki aile panelinin linkleri, ortak sayım
- `/yonet/[token]/duzenle` — Davetiyeyi sonradan düzenleme: isimler, tarih, saat, salon, adres, şehir, servis, program (linkler değişmez)
- `/p/[token]` — Aile paneli (kız evi / oğlan evi): davetli ekle, kişiye özel link, WhatsApp mesajı, hatırlatma metni, silme
- `/d/[token]` — Davetli sayfası: sadece davetli olduğu etkinlikleri görür, hesapsız LCV verir
- `/onizleme/[token]` — Davetiye önizleme
- `/onizleme/[token]/story` — Instagram hikâyesi ölçüsünde (1080×1920) dikey davetiye görseli, yönetim sayfasından indirilir
- `/kurtar` — Yönetim linkini kaybeden çift, kurtarma koduyla geri döner
- `/gizlilik` — KVKK aydınlatma TASLAĞI (avukat onayı bekliyor)
- Link önizleme posteri — `/d/[token]` ve `/onizleme/[token]` paylaşıldığında WhatsApp'ta çiftin adları, tarih ve şehir yazan poster çıkar (davetlinin adı posterde yer almaz)
- `/api/cron/cleanup` — Son etkinlikten 90 gün sonra tüm veriyi siler (Vercel Cron, her gece)

## Sağlamlaştırma
- **İstek sınırlama** (`lib/ratelimit.ts`): davetiye 5/saat, davetli 150/saat, kurtarma denemesi 10/saat — IP başına.
  IP ham hâliyle saklanmaz; `CRON_SECRET` ile birlikte özetlenir (SHA-256) ve sayaçlar gece temizlenir.
- **Kurtarma kodu**: davetiye oluşturulurken `ABCD-EFGH-JKMN` biçiminde üretilir, yönetim sayfasında hep görünür.
  Telefon/e-posta istemediğimiz için tek kurtarma yolu budur.
- **Erişilebilirlik**: 320px genişlikte yatay kaydırma yok, dokunma hedefleri ≥24px,
  metin kontrastları WCAG 2.1 AA (açık ve koyu mod, üç tema) — axe-core ile doğrulandı.

## Temalar
`lib/themes.ts` içinde üç tema var: **klasik** (bordo-altın), **krem** (kum beji & zeytin yeşili),
**gece** (lacivert & altın). Renkler 2026 Türkiye davetiye trendlerine göre seçildi.
Tema yalnızca `globals.css` değişkenlerini ezer; yeni CSS yapısı kurulmaz. Yeni tema eklemek
için `THEMES` dizisine bir kayıt eklemek yeterli — davetli sayfası, önizleme ve link posteri
otomatik uyum sağlar.

## Bilerek olmayanlar (hukuki ilkeler)
IBAN / para toplama yok · Sistem mesaj göndermez (aile kendi WhatsApp'ından paylaşır) · Telefon numarası istenmez · Fotoğraf yok · Müzik yok · Kişisel linkler arama motorlarına kapalı (X-Robots-Tag + robots.txt)

## Yerelde çalıştırma
```bash
npm install
npm run dev        # http://localhost:3000
```
`DATABASE_URL` boşsa veritabanı olarak dosya tabanlı PGlite (`.data/`) kullanılır, kurulum gerekmez.

## Yayına alma (Vercel + Postgres)
1. Kodu GitHub'a yükle, Vercel'de proje olarak içe aktar.
2. Bir Postgres veritabanı bağla (Vercel Marketplace → Neon ya da Supabase). Sunucu bölgesi KVKK kararına göre seçilmeli.
3. Ortam değişkenleri: `DATABASE_URL`, `CRON_SECRET` (rastgele uzun metin), `NEXT_PUBLIC_SITE_URL` (örn. https://buyrun.app)
4. Tablolar ilk istekte otomatik oluşur.

> **Dikkat:** Vercel ortam değişkenlerini yayın anında sabitler. Veritabanını var olan bir projeye
> sonradan bağlarsan **yeniden yayınlaman** gerekir, yoksa `DATABASE_URL` o yayına girmez.

Şu an yayında: **https://buyrun.vercel.app** (sunucu bölgesi Frankfurt / fra1, veritabanı Neon).

## Test edilenler (uçtan uca)
Oluşturma → aile paneli → davetli ekleme → davetli sayfası (sadece kendi etkinlikleri) → LCV → panelde anında sayım → diğer aile ortak sayımı görür ama listeyi görmez → silme → silinen link 404 → cron yetkisiz 401 → geçmiş tarih reddedilir.

## Sıradaki işler
- [x] Davetiye başına link önizleme görseli (Open Graph) — WhatsApp'ta poster gibi görünsün
- [x] Instagram hikâyesi boyutunda paylaşım görseli
- [x] Hazır tema/şablonlar (klasik bordo-altın · sade krem · modern koyu)
- [x] İstek sınırlama (rate limit) ve yönetim linkini kaybeden çift için kurtarma
- [ ] Ödeme (ancak avukat ve mali müşavir onayından sonra)
- [ ] Marka adı TÜRKPATENT kontrolü — "Buyrun" çalışma adıdır
