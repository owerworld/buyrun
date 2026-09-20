# Buyrun — Dijital davetiye ve LCV (MVP v0.1)

Kına ve düğün tek linkte. Üyeliksiz LCV, iki aile paneli, otomatik veri silme.

## Ne çalışıyor
- `/olustur` — Çift davetiyeyi oluşturur (düğün + isteğe bağlı kına, servis, program)
- `/yonet/[token]` — Çiftin yönetim sayfası: iki aile panelinin linkleri, ortak sayım
- `/p/[token]` — Aile paneli (kız evi / oğlan evi): davetli ekle, kişiye özel link, WhatsApp mesajı, hatırlatma metni, silme
- `/d/[token]` — Davetli sayfası: sadece davetli olduğu etkinlikleri görür, hesapsız LCV verir
- `/onizleme/[token]` — Davetiye önizleme
- `/gizlilik` — KVKK aydınlatma TASLAĞI (avukat onayı bekliyor)
- `/api/cron/cleanup` — Son etkinlikten 90 gün sonra tüm veriyi siler (Vercel Cron, her gece)

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

## Test edilenler (uçtan uca)
Oluşturma → aile paneli → davetli ekleme → davetli sayfası (sadece kendi etkinlikleri) → LCV → panelde anında sayım → diğer aile ortak sayımı görür ama listeyi görmez → silme → silinen link 404 → cron yetkisiz 401 → geçmiş tarih reddedilir.

## Sıradaki işler
- [ ] Davetiye başına link önizleme görseli (Open Graph) — WhatsApp'ta poster gibi görünsün
- [ ] Instagram hikâyesi boyutunda paylaşım görseli
- [ ] Hazır tema/şablonlar
- [ ] İstek sınırlama (rate limit) ve yönetim linkini kaybeden çift için kurtarma
- [ ] Ödeme (ancak avukat ve mali müşavir onayından sonra)
- [ ] Marka adı TÜRKPATENT kontrolü — "Buyrun" çalışma adıdır
