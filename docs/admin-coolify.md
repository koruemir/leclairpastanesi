# Admin paneli ve Coolify kurulumu

## Panel

`/admin` tek şifreli giriş ekranıdır. Girişten sonra ürün seçeneklerinin fiyatları TL olarak değiştirilir; yukarı/aşağı düğmeleri ve “Sıralamayı Kaydet” ile menü sıralanır. `/admin/yeni` fotoğraf, açıklamalar, kategori ve satış seçenekleriyle ürün ekler. Ürün silme, kategori düzenleme, sipariş yönetimi ve mevcut ürün bilgilerinin fiyat dışındaki alanlarını değiştirme yoktur.

Fiyat alanına `95` veya `95,50` yazılır; binlik ayırıcı kullanılmaz. Fotoğraflar JPEG, PNG veya WebP, en fazla 8 MB ve 40 milyon piksel olmalıdır. Fotoğraflar sunucuda döndürülür, 1600 piksele küçültülür, metadataları temizlenir ve WebP kaydedilir. Dosyalar `/media/<uuid>.webp` üzerinden sunulur.

## Yerel çalışma

`.env.example` dosyasını `.env.local` olarak kopyalayın. `ADMIN_PASSWORD` alanına kendi şifrenizi yazın; `DATA_DIR=./data` yerel kullanım için uygundur. `npm ci` ve `npm run dev` ile çalıştırın. Şifre boşsa admin girişi kapalı kalır.

Şifreyi değiştirdikten sonra uygulamayı yeniden başlatın. Önceki oturumlar geçersiz olur. Oturum 8 saat sürer; çıkış sunucudaki kaydı iptal eder. Başarısız girişler için ortak 15 dakikalık pencerede 5 deneme sınırı vardır; IP/proxy başlıkları değiştirerek atlanamaz. Doğru giriş sayacı temizler. Çok sayıda başarısız denemeden sonra pencerenin dolması beklenir.

Şifre ve oturum değerleri `NEXT_PUBLIC_` alanlarına yazılmaz. Üretim çerezi `Secure` olduğu için gerçek yayında HTTPS kullanılmalıdır. Standalone sunucu `.env.local` dosyasını Docker imajına almaz; üretim ortam değişkenlerini Coolify verir.

## Coolify

1. Build Pack: **Dockerfile**. Dockerfile yolu: `/Dockerfile`; build context: proje kökü.
2. Uygulama portu: **3000**. Uygulama örneği sayısı: **1**. Dockerfile içindeki `node server.js` başlangıç komutunu kullanın.
3. Runtime environment variables: `ADMIN_PASSWORD` (size özel bir şifre) ve `DATA_DIR=/data`. `ADMIN_PASSWORD` için build-time seçeneği gerekmez.
4. **Persistent Storage** bölümünde bir volume oluşturun; container hedefi **`/data`** olmalı. Veritabanı, SQLite WAL dosyaları ve `uploads/` birlikte bu dizinde tutulur.
5. Alan adını HTTPS ile bağlayın. Proxy, gerçek alan adını `X-Forwarded-Host` başlığında iletmeli; Server Action origin doğrulaması bunu kullanır. Wildcard origin izni eklemeyin.
6. Yayınlayın; `/admin` üzerinden giriş yapın. Yeni ürün/fiyat/sıralama değişiklikleri için redeploy gerekmez.

İmaj `node` kullanıcısıyla (UID/GID 1000) çalışır. Yeni Docker volume, imajın `/data` sahipliğini alır. Bind mount veya önceden var olan root sahipli bir volume kullanırsanız, **yalnızca bu uygulamanın veri dizininin** sahipliğini `1000:1000` yapın; uygulama oraya yazabilmelidir. Sağlık kontrolü için `GET /api/catalog` kullanılabilir; veritabanından da okur.

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_PHONE` ve `NEXT_PUBLIC_SITE_LIVE` Docker build arg olarak desteklenir. Coolify'da bu public değişkenleri build-time için de etkinleştirin. Bunlar değişirse yeniden derleme gerekir; admin şifresi yalnızca runtime değişkenidir. Demo içerik mevcutken `NEXT_PUBLIC_SITE_LIVE=false` bırakın.

### Kalıcı veri

İlk başlangıçta `src/data/catalog.ts` içindeki 12 ürün bir kez aktarılır. `settings.seeded` kaydı sonraki başlangıçlarda seed işlemini engeller; mevcut fiyatlar ve sıra ezilmez. Ürün/variant kimlikleri korunur. Sonraki katalog değişikliklerinin kaynağı SQLite'tır; seed dosyasını düzenlemek mevcut veritabanını değiştirmez.

- `/data/catalog.sqlite`: ürünler, oturumlar ve giriş deneme sayacı.
- `/data/catalog.sqlite-wal`, `/data/catalog.sqlite-shm`: SQLite çalışma dosyaları.
- `/data/uploads/`: yüklenen fotoğraflar.

Yerel `data/`, `.env*` ve runtime verileri Git ve Docker build context dışında tutulur. Uygulama tek sunucu/tek instance için hazırlanmıştır; `/data` paylaşımıyla yatay ölçekleme amaçlanmaz. Kalıcı disk yedek değildir. Tutarlı yedek için uygulamayı durdurup `/data` dizininin tamamını kopyalayın; geri yüklerken de uygulama kapalı olmalı ve sahiplik korunmalıdır.

## Mağaza ve sepet

Mağaza sayfaları güncel SQLite içeriğinden sunucuda üretilir. Yeni slug hemen erişilebilir. Sepet localStorage'da yalnızca kimlikler ve miktarlar tutar. Katalog, sayfa geçişi/pencereye dönüşte ve önizleme/kopyalama/WhatsApp geçişinden önce yenilenir. İncelenen mesajın fiyatı veya içeriği değiştiyse işlem durur ve yeni mesajın tekrar incelenmesi istenir. Katalog alınamıyorsa eski fiyatla devam edilmez.

Yeni ürünler mevcut demo yayının bir parçası olarak `isDemo: true` eklenir; indeksleme kendiliğinden açılmaz. `/admin` ve `/sepet` sitemap'e girmez. Bu panel gerçek ürün doğrulaması veya SEO yayın durumu değiştirme aracı içermez.

## Testler

```sh
npm run test
npm run typecheck
npm run build
```

Mağaza testleri temiz demo veritabanında Chromium ve WebKit ile çalıştırılır. Admin uçtan uca testi veri değiştirdiği için **yalnızca atılabilir bir test veritabanına karşı** açıkça etkinleştirilir:

```sh
ADMIN_E2E_PASSWORD=<test-sunucusunun-sifresi> \
PLAYWRIGHT_BASE_URL=http://localhost:3003 \
npx playwright test admin.spec.ts --project=desktop-chromium --workers=1
```

Bu test yanlış/doğru giriş, oturumsuz yazma reddi, fiyat güncelleme, eski sepetin yeniden fiyatlanması, bağlantı hatasında aktarımın engellenmesi, fotoğraflı ürün ekleme, yeni slug, sıralama, çıkış, erişilebilirlik ve 360/390/768/1440 px taşma kontrolünü kapsar. Gerçek WhatsApp mesajı göndermez.

Mobil WebKit admin testi üretim `Secure` çerezleri için HTTPS sunucusunda çalıştırılmalıdır (`--project=mobile-webkit`). Yerel, kendinden imzalı test sertifikasıyla çalışırken yalnızca test süreci için `PLAYWRIGHT_LOCAL_HTTPS=true` verilebilir; bu seçenek uygulamanın güvenlik ayarlarını değiştirmez.
