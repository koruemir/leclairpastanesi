# Admin paneli ve Coolify kurulumu

## Panel

`/admin` tek şifreli giriş ekranıdır. Girişten sonra ürün seçeneklerinin fiyatları TL olarak değiştirilir; yukarı/aşağı düğmeleri ve “Sıralamayı Kaydet” ile menü sıralanır. `/admin/yeni` fotoğraf, açıklamalar, kategori ve satış seçenekleriyle ürün ekler. Ürün silme, kategori düzenleme, sipariş yönetimi ve mevcut ürün bilgilerinin fiyat dışındaki alanlarını değiştirme yoktur.

Fiyat alanına `95` veya `95,50` yazılır; binlik ayırıcı kullanılmaz. Fotoğraflar JPEG, PNG veya WebP, en fazla 8 MB ve 40 milyon piksel olmalıdır. Fotoğraflar sunucuda döndürülür, 1600 piksele küçültülür, metadataları temizlenir ve WebP kaydedilir. Dosyalar `/media/<uuid>.webp` üzerinden sunulur.

## Yerel çalışma

`.env.example` dosyasını `.env.local` olarak kopyalayın. `ADMIN_PASSWORD` alanına kendi şifrenizi yazın; `DATA_DIR=./data` yerel kullanım için uygundur. `npm ci` ve `npm run dev` ile çalıştırın. Şifre boşsa admin girişi kapalı kalır.

Şifreyi değiştirdikten sonra uygulamayı yeniden başlatın. Önceki oturumlar geçersiz olur. Oturum 8 saat sürer; çıkış sunucudaki kaydı iptal eder. Başarısız girişler için ortak 15 dakikalık pencerede 5 deneme sınırı vardır; IP/proxy başlıkları değiştirerek atlanamaz. Doğru giriş sayacı temizler. Çok sayıda başarısız denemeden sonra pencerenin dolması beklenir.

Şifre ve oturum değerleri `NEXT_PUBLIC_` alanlarına yazılmaz. Üretim çerezi `Secure` olduğu için gerçek yayında HTTPS kullanılmalıdır. Standalone sunucu `.env.local` dosyasını Docker imajına almaz; üretim ortam değişkenlerini Coolify verir.

## Coolify

Bu bölüm repo içindeki uygulamayı Coolify'a kurmak içindir. Alan adı, DNS, HTTPS sertifikası ve aşağıdaki ayarlar uygulamanın kurulacağı Coolify hesabında tamamlanır.

### Kaynak ve uygulama ayarları

1. Coolify'da yeni bir Git uygulaması oluşturun. Repo: `git@github.com:koruemir/leclairpastanesi.git`. Özel repo için GitHub bağlantısı veya bu repoyu okuyabilen bir deploy key kullanın.
2. **Branch: `main`** seçin. Güncel vitrin, admin paneli ve yayınlama dosyaları bu daldadır.
3. **Build Pack: Dockerfile**, **Base Directory: `/`**, **Dockerfile Location: `/Dockerfile`**. Build context proje köküdür. Ayrı install/build/start komutları tanımlamayın; bunları Dockerfile yönetir.
4. **Ports Exposes: `3000`**, uygulama örneği sayısı **1**. Dockerfile `0.0.0.0:3000` üzerinde `node server.js` çalıştırır. Dışarıya bir host portu yayımlamak gerekmez; alan adına Coolify proxy üzerinden erişilir.
5. **Advanced → Inject Build Args to Dockerfile: kapalı**. Kullanılan public build arg'ları Dockerfile içinde zaten açıkça tanımlıdır.
6. **Advanced → Consistent Container Names: açık** ve **Stop Grace Period: 30 saniye**. Böylece yeniden yayınlama sırasında mevcut container durur, sonra yenisi başlar. Bu proje tek instance ve yerel SQLite kullanır; bu ayarla kısa bir yeniden başlatma kesintisi beklenir.

Coolify'ın [Dockerfile kurulumu](https://coolify.io/docs/applications/builds/dockerfile) build context, iç port ve build arg ayarlarını açıklar. Yalnızca örnek sayısını 1 yapmak geçici container çakışmasını engellemez; **Consistent Container Names**, [rolling updates belgesinde](https://coolify.io/docs/applications/deployments/rolling-updates) belirtilen önce durdurma koşuludur.

### Ortam değişkenleri

`.env.coolify.example` dosyasını değer listesi olarak kullanın. Gerçek şifreyi Coolify **Configuration → Environment Variables** içinde girin; repoya veya Dockerfile'a yazmayın.

| Değişken | Değer | Build Variable | Runtime Variable |
| --- | --- | --- | --- |
| `ADMIN_PASSWORD` | Size özel, uzun ve rastgele bir şifre | **Kapalı** | **Açık** |
| `DATA_DIR` | `/data` | **Kapalı** | **Açık** |
| `NEXT_PUBLIC_SITE_URL` | Gerçek HTTPS alan adınız; hazır değilse boş | **Açık** | **Açık** |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Gerçek işletme numarası, ülke koduyla yalnızca rakamlar; hazır değilse boş | **Açık** | **Açık** |
| `NEXT_PUBLIC_SITE_LIVE` | `false` | **Açık** | **Açık** |

`ADMIN_PASSWORD` için **Literal** seçeneğini de açın; şifredeki `$` gibi karakterler değişken olarak yorumlanmasın. Coolify yeni değişkenlerde Build ve Runtime seçeneklerini varsayılan olarak birlikte açabilir. Şifre ve `DATA_DIR` için **Build Variable'ı özellikle kapatın**. Docker build arg'ları image metadata içinde görünebilir. [Coolify ortam değişkenleri](https://coolify.io/docs/applications/configuration/environment-variables)

`NEXT_PUBLIC_*` değerleri derleme sırasında tarayıcı paketine yazılır. Bu üç değer değiştiğinde **yeni deployment ile yeniden derleyin**; yalnızca restart yeterli değildir. `ADMIN_PASSWORD` veya `DATA_DIR` değişikliğinde runtime ortamının yenilenmesi için restart gerekir. Şifre değişince eski admin oturumları geçersiz olur. [Next.js ortam değişkenleri](https://nextjs.org/docs/app/guides/environment-variables)

Gerçek alan adı veya WhatsApp numarası verilmediyse bu alanlar boş kalabilir. Mesaj önizleme/kopyalama çalışır; örnek numaraya yönlendirme yapılmaz. **Demo içerik mevcutken `NEXT_PUBLIC_SITE_LIVE=false` kalır.** Bu panel ürün doğrulamasını ve indekslemeyi açmaz; değişkeni `true` yapmak da doğrulanmış işletme ve gerçek katalog koşullarını tek başına sağlamaz.

### Kalıcı disk ve izinler

**Configuration → Persistent Storage → Add → Volume Mount** ekleyin:

- Name: örneğin `lecalir-data`.
- Source Path: **boş**; Docker'ın yönettiği named volume kullanılır.
- Destination Path: **`/data`**.

Diski **ilk yayından önce** ekleyin. Veritabanı, SQLite WAL dosyaları ve yüklenen fotoğraflar aynı volume'da tutulur. Sonradan eklenen mount, daha önce silinmiş container verisini geri getirmez. [Coolify kalıcı depolama](https://coolify.io/docs/applications/configuration/persistent-storage)

İmaj `node` kullanıcısıyla **UID/GID `1000:1000`** çalışır. Yeni ve boş named volume, imajın `/data` sahipliğini alır. Bind mount veya önceden var olan root sahipli bir volume kullanıyorsanız sunucuda **yalnızca bu uygulamaya ayrılmış veri dizininin** sahipliğini `1000:1000` yapın. Uygulamanın hem `/data` hem de mevcut `/data/uploads` içine yazabilmesi gerekir. Çözüm olarak uygulamayı root çalıştırmayın veya genel `chmod 777` kullanmayın.

Preview deployment açılacaksa ayrı volume, ayrı admin şifresi ve `NEXT_PUBLIC_SITE_LIVE=false` kullanın. Preview uygulamasını üretimin `/data` volume'una bağlamayın. Tek volume'u birden fazla sunucu/uygulama instance'ı arasında paylaşmayın.

### HTTPS ve sağlık kontrolü

Gerçek alan adının DNS kayıtlarını Coolify sunucusuna yönlendirin ve uygulama alan adını **HTTPS** ile tanımlayın. Admin'in üretim oturum çerezi `Secure` olduğu için HTTP adresinden giriş oturumu kullanılamaz. Proxy, gerçek alan adını `Host`/`X-Forwarded-Host` başlığında iletmelidir. Server Action origin doğrulamasını kapatmayın veya wildcard origin izni eklemeyin.

Dockerfile'daki **`HEALTHCHECK`**, Node'un yerleşik `fetch` işleviyle container içindeki **`GET /api/health`** adresini kontrol eder. Ek `curl`/`wget` kurulumu gerekmez. Coolify bu image healthcheck'ini devralır; panelde ayrıca HTTP healthcheck tanımlamak gerekmez. `/api/health` yanıtı `200` olduğunda uygulamanın veri katmanı kontrolü başarılıdır. Çalışan uygulamada veri kontrolü başarısızsa endpoint `503` döner. Veri dizini nedeniyle başlangıç tamamen başarısızsa Next.js `500` döndürebilir; her iki durumda da container sağlıksız sayılır. Ayrıntı için uygulama loglarını inceleyin.

Coolify'ın [health checks belgesine](https://coolify.io/docs/applications/configuration/health-checks) göre Dockerfile healthcheck'i paneldeki ayardan önceliklidir. Panelden HTTP kontrolüne geçilecekse imajdaki kontrol kaldırılmalı ve final imaja `curl` veya `wget` eklenmelidir; bu proje mevcut Node kontrolünü kullanır.

### İlk yayın doğrulaması

1. Deploy edin; build logunda başarılı derlemeyi, runtime logunda sunucunun açıldığını ve container'ın **healthy** olduğunu doğrulayın.
2. HTTPS alan adından ana sayfayı, menüyü ve bir ürün sayfasını açın. Fotoğrafların ve fontların yüklendiğini kontrol edin.
3. `/admin` üzerinden giriş yapın; bir seçenek fiyatını güncelleyin, katalogda kullanılacak bir ürün ekleyin ve sıralamayı kaydedin. Mağaza değişiklikleri yeniden derleme olmadan göstermelidir. Panelde ürün silme bulunmadığı için deneme ürünüyle yapılacak testlerde ayrı, atılabilir bir volume kullanın.
4. Uygulamayı aynı volume ile yeniden başlatın/yeniden yayınlayın. Kaydedilen fiyat, ürün sırası ve yüklenen fotoğrafın korunduğunu doğrulayın.
5. Sepette güncel fiyatın kullanıldığını ve WhatsApp numarası boşsa yalnızca önizleme/kopyalama sunulduğunu kontrol edin.

Veri içeren volume'u silmek veya değiştirmek yeni ve boş katalog oluşturur. Yayından önce seçili branch'i, `/data` mount'unu ve yedeği kontrol edin.

### Kalıcı veri

İlk başlangıçta `src/data/catalog.ts` içindeki 12 ürün bir kez aktarılır. `settings.seeded` kaydı sonraki başlangıçlarda seed işlemini engeller; mevcut fiyatlar ve sıra ezilmez. Ürün/variant kimlikleri korunur. Sonraki katalog değişikliklerinin kaynağı SQLite'tır; seed dosyasını düzenlemek mevcut veritabanını değiştirmez.

- `/data/catalog.sqlite`: ürünler, oturumlar ve giriş deneme sayacı.
- `/data/catalog.sqlite-wal`, `/data/catalog.sqlite-shm`: SQLite çalışma dosyaları.
- `/data/uploads/`: yüklenen fotoğraflar.

Yerel `data/`, gerçek değer içeren `.env*` dosyaları ve runtime verileri Git ve Docker build context dışında tutulur; yalnızca boş/örnek ortam şablonları repoda bulunur. Uygulama tek sunucu/tek instance için hazırlanmıştır; `/data` paylaşımıyla yatay ölçekleme amaçlanmaz. Kalıcı disk yedek değildir. Tutarlı yedek için uygulamayı durdurup `/data` dizininin tamamını kopyalayın; geri yüklerken de uygulama kapalı olmalı ve sahiplik korunmalıdır.

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
