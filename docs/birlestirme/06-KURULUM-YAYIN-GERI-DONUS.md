# Kurulum, güncelleme, canlı yayın ve geri dönüş

## 1. Gerekenler
- Node.js 22, npm
- (Android APK'yı kendin üretmek istersen) Expo hesabı, `npx eas-cli@latest` — ya da Android SDK + JDK 17
- (iOS için) Apple Developer hesabı — **şu an yok**, iOS kurulum dosyası bu yüzden üretilemedi

ZIP'te `node_modules`, `.next`, `.data` (yerel veritabanı), `.env` dosyaları, imza anahtarları ve kişisel veri **yoktur**. Bağımlılıklar aşağıdaki komutlarla yeniden kurulur.

## 2. Sunucu + davetli sayfaları (Next.js)
```bash
npm install
npm run dev            # http://localhost:3000 — yerel veritabanı .data/ klasörüne kendiliğinden kurulur
```
Canlıda (Vercel) veritabanı Neon Postgres'tir; bağlantı bilgisi Vercel ortam değişkenlerindedir, koda yazılmaz.

Üretim modunda denemek için:
```bash
npx next build && npx next start -p 3001
```

## 3. Mobil uygulama (Expo)
```bash
cd buyrun-mobile
npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL=https://buyrun.vercel.app
npx expo start         # telefonda geliştirme derlemesi veya web önizleme
```

### Yerel sunucuyla test (bilgisayar + aynı Wi-Fi'deki telefon)
Uygulama güvenlik gereği yalnızca HTTPS sunucuya bağlanır. Yerel test için tek istisna, **özel IP adresine** izin veren test ayarıdır:
```bash
# sunucu:
npx next dev -p 3001 -H 0.0.0.0
# uygulama (web önizleme):
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001 EXPO_PUBLIC_LOCAL_PREVIEW=1 npx expo export -p web --clear
```
**Önemli:** `EXPO_PUBLIC_...` değişkenlerini değiştirdiğinde **`--clear`** kullan. Metro eski değeri önbellekte tutar ve uygulama "güvenli bir sunucu bağlantısı ayarlanmamış" hatası verir.

Yerel test APK'sı (Astra'nın yöntemi, Android SDK gerekir): `BUYRUN_LOCAL_IP=192.168.1.X sh buyrun-mobile/scripts-build-local.sh`. Bu APK'nın adı "Buyrun Test" olur ve yalnızca o IP'ye şifresiz bağlanır. **Mağazaya gönderilmez.**

### Bulut derlemesi (EAS)
```bash
cd buyrun-mobile
npx eas-cli@latest build -p android --profile preview      # kurulabilir APK, canlı sunucuya bağlanır
npx eas-cli@latest build -p ios --profile production       # Apple hesabı gerekir
```
Proje: `owerworlds-team/buyrun-mobile` (projectId `4944b7f5-fae5-4e6f-9ae4-356e4a7d13fa`).

## 4. Otomatik kontroller
```bash
npx tsc --noEmit -p .                         # web tür denetimi
(cd buyrun-mobile && npx tsc --noEmit && npx expo lint && npm run test:storage)
TEST_BASE_URL=http://127.0.0.1:3001 node scripts/check-social.mjs   # yalnızca yerel sunucuya karşı çalışır
```

## 5. Canlı yayın nasıl oluyor?
- `claude/wizardly-meitner-5vakb6` dalına gönderilen her commit, Vercel tarafından **otomatik olarak** `https://buyrun.vercel.app` adresine yayınlanır.
- Sıra: yerel test → `next build` → üretim modunda duman testi → commit → gönderim → canlıda kontrol (ana sayfa, bir davet sayfası, önizleme kartı, takvim).
- Veritabanı değişiklikleri yalnızca ekleme türündedir; uygulama ilk istekte kendisi uygular. Bu sürümde yeni veritabanı değişikliği **yok**.

### Bu sürümde canlıya giden değişiklikler
- Davetli sayfasında birleşik katılım + oylama + sorular, duyurular üstte
- `/m/<davet>/takvim` ve `/m/<davet>/opengraph-image` yeni adresleri
- Mobil davet sayfalarının özel başlık/açıklaması
- Tüm takvim dosyalarında 1 gün önce hatırlatma ve `;` düzeltmesi
- Web sihirbazı son adımında fiyat notu

Mobil uygulama değişiklikleri canlı siteye değil, **yeni APK'ya** girer.

## 6. Geri dönüş (rollback)
Veritabanı değişikliği olmadığı için kod geri dönüşü veri kaybına yol açmaz.

**En hızlı (1 dakika) — Vercel panelinden:**
1. vercel.com → buyrun projesi → Deployments
2. Önceki başarılı yayını bul → "…" → **Promote to Production** (ya da "Instant Rollback")

**Kod ile:**
```bash
git revert <birleştirme-commit'i>      # yalnızca o değişikliği geri alır, geçmişi silmez
git push -u origin claude/wizardly-meitner-5vakb6
```
Referans noktaları (commit kimlikleri uzak dalda mevcut; `claude-final` / `astra-final` etiketleri yalnızca yerel kopyada, uzak sunucuya gönderilemedi):
- `e408d68` (`claude-final`) — birleştirmeden önceki Claude sürümü
- `6c3b998` (`astra-final`) — Astra'nın olduğu gibi içe alınmış sürümü

Bir etiketteki dosyaya bakmak için: `git show 6c3b998:app/m/[token]/social.tsx`

**Mobil:** Eski APK'yı yeniden kurmak yeterli (EAS paneli → Builds → önceki derleme). Sunucu API'si geriye uyumlu olduğu için eski uygulama yeni sunucuyla çalışır.
