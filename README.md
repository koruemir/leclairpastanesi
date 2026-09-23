# Lecalir Pastanesi

Güzelce, Büyükçekmece için mobil öncelikli pastane vitrini. Next.js 16 App Router, React, TypeScript ve Tailwind CSS ile hazırlanmıştır. Mağaza vitrini ve tek şifreli `/admin` ürün yönetimi içerir; sipariş talebi müşteri tarafından WhatsApp'ta gönderilir.

## Çalıştırma

Node.js 22 önerilir (Docker imajı Node 22 kullanır). Bağımlılık sürümleri `package-lock.json` içinde sabittir.

```sh
npm ci
npm run dev
```

Site: http://localhost:3000

Üretim önizlemesi:

```sh
npm run build
npm run start
```

`npm run start`, standalone üretim sunucusunu açar ve gerekli statik dosyaları hazırlar. Yerel `.env.local` ayarlarını yükler; geliştirme ve üretim önizlemesi aynı `DATA_DIR` dizinini kullanır. Özel port için `npm run start -- --port 3001` kullanılabilir. Docker kendi standalone sunucusunu doğrudan çalıştırır.

## Coolify'da yayınlama

Git kaynağında **`main`** dalını seçin. Build Pack **Dockerfile**, base directory **`/`**, Dockerfile location **`/Dockerfile`**, exposed port **`3000`** olmalıdır. Uygulama tek instance çalışır; Persistent Storage için bir **Volume Mount** oluşturup destination path alanını **`/data`** yapın.

[Coolify ortam değişkeni şablonu](.env.coolify.example) public build ayarlarını ve sunucu ayarlarını ayırır. `ADMIN_PASSWORD` yalnızca Runtime açık, Build kapalı ve Literal açık olmalıdır. Üç `NEXT_PUBLIC_` değeri derleme sırasında alınır. Gerçek HTTPS alan adını Coolify Domains ve `NEXT_PUBLIC_SITE_URL` alanlarına girin; örnek içerikle `NEXT_PUBLIC_SITE_LIVE=false` bırakın.

Docker imajı `/api/health` üzerinden SQLite bağlantısını kontrol eden sağlık kontrolünü içerir; ek `curl` kurulumu gerekmez. Coolify'da **Consistent Container Names** açık ve **Stop Grace Period** 30 saniye olmalıdır; böylece eski ve yeni sürümler aynı SQLite diskini eşzamanlı kullanmaz. Yeniden yayınlama sırasında kısa kesinti olabilir.

Alanlar, disk izinleri, HTTPS, yedekleme ve doğrulama adımları: [Admin ve Coolify kurulum rehberi](docs/admin-coolify.md).

ARM64/AMD64 Docker derlemeleri, container testleri ve aynı diskle yeniden kurulum sonucu: [Coolify hazırlık doğrulaması](reports/coolify-verification.md).

## Sayfalar

- `/`: vitrin, kategori bağlantıları, seçili ürünler, sipariş adımları, SSS.
- `/menu` ve `/menu/[kategori]`: 12 örnek ürün, 4 kategori; Türkçe arama ve fiyat sıralaması. Arama ve sıralama paylaşılabilir URL'de korunur.
- `/urun/[slug]`: ürün, boy/paket seçimi, miktar, sepete ekleme ve benzer ürünler.
- `/sepet`: sepet, teslimat formu, mesaj önizlemesi, kopyalama ve yapılandırıldığında WhatsApp bağlantısı.
- `/iletisim`: mağaza konumu ve teslim alma seçenekleri.
- `/admin` ve `/admin/yeni`: şifreli ürün/fiyat/sıralama yönetimi.

## İçerik ve fiyat güncelleme

`/admin` üzerinden seçenek fiyatlarını değiştirin ve ürünleri sıralayın; `/admin/yeni` üzerinden fotoğraflı ürün ekleyin. Şifre sunucudaki `ADMIN_PASSWORD` ortam değişkenindedir. Yeni kayıtlar ve değişiklikler yeniden derleme gerektirmez.

SQLite ve fotoğraflar `DATA_DIR` dizininde saklanır. Yerel varsayılan `./data`, Coolify hedefi `/data` kalıcı volume'dür. `src/data/catalog.ts` yalnızca ilk kurulum için seed kaynağıdır. [Admin ve Coolify kurulum rehberi](docs/admin-coolify.md) ortam değişkenleri, kalıcı disk, oturumlar ve test komutlarını içerir.

Görseller `public/images/` altında yereldir. Tümü yapay zekâ ile üretilmiş örnek fotoğraflardır; işletmenin gerçek ürünlerini belgeledikleri iddia edilmez. Üretim promptları ve kaynak kayıtları `docs/image-prompts.json` içindedir.

## İşletme bilgileri ve WhatsApp

`src/lib/business.ts` marka, konum, harita, açık adres, telefon ve saatleri içerir. Verilen Google Maps bağlantısı değiştirilmeden korunmuştur; harita kaydındaki işletme adı site markası olarak alınmamıştır. Doğrulanmamış açık adres, telefon ve çalışma saatleri boş bırakılmıştır. `hours` alanı doldurulursa Schema.org `openingHours` biçiminde olmalıdır (ör. `Mo-Fr 09:00-18:00`; bu örnek gerçek mağaza saati değildir).

`.env.example` dosyasını `.env.local` olarak kopyalayın ve gerçek sipariş hattını `NEXT_PUBLIC_WHATSAPP_PHONE` alanına yazın. Uluslararası formatta **yalnızca rakam** kullanılmalıdır; `+`, boşluk veya yerel baştaki `0` eklenmemelidir. Bu alan müşteri tarayıcısında görünür; gizli anahtar değildir.

Telefon boş veya geçersizse WhatsApp düğmesi pasiftir; form doğrulaması, önizleme ve kopyalama çalışır. Doğru numara eklendiğinde bağlantı mesajı hazırlar; **otomatik mesaj göndermez**. Sepet temizlenmez, siparişin alındığı veya ödendiği söylenmez. Gerçek numarayla iOS, Android ve WhatsApp Web doğrulaması yayın öncesinde yapılmalıdır.

`NEXT_PUBLIC_` değerleri derleme sırasında alınır; değiştirdikten sonra geliştirme sunucusunu yeniden başlatın veya üretimi yeniden derleyin.

## Sepet ve müşteri bilgileri

- `lecalir-cart-v1` tarayıcı kaydında yalnızca ürün kimliği, seçenek kimliği ve adet tutulur.
- Güncel fiyatlar katalogdan hesaplanır; tarayıcı kaydındaki fiyatlara güvenilmez.
- Sepete ekleme sonucu doğrulanmadan başarı gösterilmez. Katalog isteği sekiz saniyede sonuçlanmazsa yeniden denenebilir hata verilir; başka sekmeden gelen yeni ürünler katalog yenilenirken kaybolmaz.
- Silinen/gizlenen ürünler, bozuk kayıtlar ve geçersiz miktarlar ayıklanır; aynı ürün/seçenek 99 adetle sınırlandırılır.
- Ad, adres, mahalle ve not yalnızca o sayfanın belleğinde bulunur. Yenilemede silinir; localStorage'a veya bir sunucuya gönderilmez.
- Mağazadan alım seçilince adres alanları görünmez ve mesajdan tamamen çıkarılır.
- Paket servis ücretine, bölge sınırına veya teslim süresine ilişkin uydurma vaat yoktur. Bunlar WhatsApp görüşmesinde netleşir.
- Analitik, reklam takipçisi, harita iframe'i, ödeme veya kullanıcı hesabı yoktur.

## SEO ve gerçek yayına geçiş

Demo varsayılan olarak `noindex, follow` üretir. `robots.txt` taramaya izin verir; böylece botlar `noindex` işaretini görebilir. Demo sitemap'i hiçbir URL içermez. Sepet her durumda indekslenmez ve sitemap'e girmez.

İndeksleme için tüm koşullar birlikte gereklidir:

1. Gerçek içerik, görseller ve fiyatlar doğrulanmalı; görünür ürünlerde `isDemo: false` olmalı.
2. İşletmenin gerçek adresi ve telefonu girilmeli; `business.verified` doğrulamadan sonra `true` yapılmalı.
3. `NEXT_PUBLIC_SITE_URL` gerçek HTTPS alan adı olmalı.
4. `NEXT_PUBLIC_SITE_LIVE=true` ayarlanmalı ve yeni derleme yapılmalı.

Bu koşullardan biri eksikse sistem `noindex` kalır; varsayımsal bir alan adına canonical üretmez. Gerçek yayın durumunda `Bakery` ve gerçek ürünlere ait `Product`/`Offer` şemaları etkinleşir. Breadcrumb şeması yalnızca gerçek site URL'si yapılandırıldığında üretilir. Sahte stok, yıldız veya değerlendirme verisi yoktur. Sosyal paylaşım için başlık, açıklama ve yerel vitrin görselinden üretilen 1200 × 630 piksel kart bulunur. WhatsApp ve diğer sosyal uygulamalarda doğru mutlak görsel adresi için gerçek `NEXT_PUBLIC_SITE_URL` ayarlanmalıdır.

## Kontroller

```sh
npm run test
npm run typecheck
npm run build
npx playwright install chromium webkit
```

Çalışan üretim sunucusuna karşı tarayıcı testleri:

```sh
# Terminal 1
npm run start -- --port 3001
# Terminal 2
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

Testler fiyat hesaplarını, kayıt temizliğini, Türkçe arama ve WhatsApp kodlamasını, paylaşılabilir filtreleri, sıralamayı, teslimat formunu, teslim şekli değişiminde adresin mesajdan çıkarılmasını, farklı ürün seçeneklerini, sepet kalıcılığını, sekmeler arası güncellemeyi, bağlantı zaman aşımını, demo SEO'yu, erişilebilirliği ve 360/390/768/1440 px genişlikleri kapsar. Mesajlar gerçek bir WhatsApp hesabına gönderilmez.

Lighthouse, geliştirme sunucusu yerine üretim derlemesi üzerinde çalıştırılmalıdır. Hedef mobil performans 90+, canlı p75 LCP ≤2,5 saniye, INP ≤200 ms, CLS ≤0,1. Gerçek kullanıcı CWV sonuçları ancak yayından sonra yeterli ziyaretçi verisiyle doğrulanabilir.

## Kapsam

Tek şifreli admin, fiyat düzenleme, fotoğraflı ürün ekleme ve sıralama tamamlanmıştır. Sipariş yönetimi, stok, ödeme, roller ve ürün silme kapsam dışıdır. Bu proje henüz herhangi bir herkese açık alan adına yayımlanmamıştır.
