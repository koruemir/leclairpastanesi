# Coolify hazırlık doğrulaması

Tarih: 23 Eylül 2026. Branch: `feat/lecalir-admin`. Bu rapor yerel Docker doğrulamasıdır; bir Coolify sunucusuna veya gerçek alan adına yayın yapıldığı anlamına gelmez.

## Üretim imajları

Çok aşamalı Dockerfile, Node 22 Bookworm Slim ve Next.js standalone çıktısıyla iki mimaride başarıyla derlendi:

- `docker build -t lecalir:coolify-ready .` — yerel `linux/arm64`.
- `docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_SITE_URL=https://lecalir-build-check.invalid -t lecalir:coolify-amd64 .` — `linux/amd64`, Docker Desktop emülasyonu.

İkinci komuttaki `.invalid` adresi yalnızca build arg doğrulaması için kullanılan, yayına ait olmayan test değeridir. Gerçek yayında Coolify değişkenlerine gerçek alan adı girilir.

Her iki imaj container olarak açıldı ve Docker sağlık durumu `healthy` oldu. Çalışan süreç UID/GID `1000:1000`; SQLite ve Sharp yerel modülleri her iki mimaride çalışıyor. `/app` altında `.env` veya SQLite verisi bulunmuyor. Admin şifresi runtime ayarıdır; Dockerfile içinde şifre veya şifre build arg'ı yoktur.

## Container kontrolleri

| Kontrol | Sonuç |
| --- | --- |
| `GET /api/health` | `200`, `{"status":"ok"}`, `Cache-Control: no-store` |
| Temiz veri dizininde katalog | 12 ürün; SQLite ilk kurulum başarılı |
| Mağaza, kategori, ürün, sepet, admin ve paylaşım görseli | HTTP 200 |
| CSS, mevcut ürün görseli ve `next/image` | Başarıyla sunuldu; görsel optimizasyonu çalıştı |
| Yeni ürünün sayfası | Yeniden derleme olmadan HTTP 200 ve ürün metni ilk HTML'de |
| Demo SEO | `noindex` korundu |
| Public build değişkeni | AMD64 HTML canonical değeri build sırasında verilen alan adını kullandı; farklı runtime alan adı bunu değiştirmedi |
| Şifre eksikliği | Admin formu yapılandırma hatası gösterdi; oturum çerezi oluşturmadı; `/admin/yeni` girişe yönlendirdi |
| Kullanılamayan veri dizini | `DATA_DIR=/dev/null` ile başlangıç başarısız; HTTP 500 ve Docker `unhealthy` |

Olumsuz container kontrolünde beklemeyi kısaltmak için yalnız test container'ının healthcheck aralığı/start period değeri 1 saniye, retries değeri 1 yapıldı. Üretim Dockerfile ayarları 30 saniye aralık, 5 saniye timeout, 30 saniye başlangıç süresi ve 3 denemedir. Endpoint birim testleri, çalışan veri bağlantısının bozulması halinde ayrıntı sızdırmadan HTTP 503 üretmesini ayrıca doğrular.

## Admin ve kalıcılık

Atılabilir named volume `/data` yoluna bağlandı. Var olan üretim E2E testleri bu Docker container'a karşı çalıştırıldı:

- Masaüstü Chromium: yanlış/doğru şifre, oturumsuz yönetim isteğinin reddi, seçenek fiyatı güncelleme, eski sepetin yeni fiyatı alması, bağlantı hatasında aktarımın engellenmesi, fotoğraflı ürün ekleme, yeni ürün bağlantısı, sıralama, çıkış ve erişilebilirlik başarılı.
- Mobil WebKit: yerel HTTPS test proxy'si üzerinden Secure çerezle giriş, klavyeden giriş, geçersiz fiyat hatası, seçenekli ürün formu ve çıkış başarılı. 360/390/768/1440 px taşma kontrolleri geçti.

İki tarayıcıya özgü aktif test geçti; her proje kendisine ait olmayan testi atladı. Gerçek WhatsApp mesajı gönderilmedi.

Admin testinde 13. ürün eklendi, fotoğraf WebP olarak yüklendi ve ürün sırası değiştirildi. Mevcut bir ürünün fiyatı ayrıca yalnız bu test veritabanında 12345 kuruş olarak işaretlendi. Katalog JSON'u ve fotoğrafın SHA-256 özeti kaydedildikten sonra container durduruldu ve kaldırıldı. Aynı volume ile yeni container oluşturuldu:

- Katalog JSON'u bütünüyle aynı kaldı.
- İşaretlenen fiyat, yeni ürün ve sıralama korundu; başlangıç seed'i kayıtları ezmedi.
- Yüklenen fotoğraf aynı URL'de HTTP 200 verdi ve SHA-256 özeti aynı kaldı.
- Yeni container sağlık kontrolünden geçti.

## Kod kontrolleri ve yayın sınırı

- `npm run test`: 25 test başarılı.
- `npm run typecheck`: başarılı.
- Her iki Docker derlemesindeki `npm run build`: başarılı, TypeScript dahil.

Gerçek Coolify yayını için [kurulum belgesindeki](../docs/admin-coolify.md) kaynak branch, HTTPS alan adı, runtime admin şifresi ve `/data` kalıcı disk ayarları gerekir. Tek instance ve önce eski container'ı durduran yayın ayarı kullanılır. Gerçek işletme bilgileri henüz verilmediğinden demo/noindex korunur. Gerçek alan adı, sertifika, sunucu disk izinleri ve gerçek WhatsApp hattı bu yerel testin kapsamı dışındadır.
