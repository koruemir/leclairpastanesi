# Faz 1 doğrulama kaydı

## Çalışan sürüm

- Next.js 16.3.5, React 19.3.0, Tailwind CSS 4.3.3.
- Üretim önizlemesi: http://localhost:3001
- Tüm katalog, kategori ve ürün detay sayfaları önceden HTML olarak üretildi.
- Gerçek bir WhatsApp hesabına mesaj gönderilmedi.

## Otomatik kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm run test` | 11 / 11 başarılı |
| `npm run typecheck` | Başarılı |
| `npm run build` | Başarılı; 24 statik çıktı |
| Playwright Chromium + iPhone/WebKit | 11 başarılı; 1 tekrarlı ekran genişliği taraması WebKit projesinde bilinçli atlandı |
| Axe WCAG 2 A/AA ve 2.1 AA | Ana sayfa, menü, ürün, iletişim ve dolu sepette ihlal bulunmadı; iki tarayıcı motorunda |
| 360, 390, 768, 1440 px | Ana sayfa, menü, ürün, iletişim ve sepet sayfalarında yatay taşma yok |
| Üretim bağımlılık denetimi | Bilinen açık bulunmadı |

Sepet ekleme, boyut ayrımı, adet/toplam hesabı, yenileme, bozuk tarayıcı kaydı, zorunlu alanlar, adresin mağazadan alım mesajına dahil edilmemesi, Türkçe karakterler ve masaüstünde mesaj kopyalama doğrulandı. CUA ile ayrıca 390 px ürün detayı, dolu sepet, teslimat seçenekleri ve mesaj önizlemesi görsel olarak incelendi.

## Mobil Lighthouse

Üretim derlemesinde Lighthouse 12.8.2, mobil simülasyon:

| Ölçüm | Sonuç |
| --- | --- |
| Performans | **91 / 100** |
| Erişilebilirlik | **100 / 100** |
| İyi uygulamalar | **100 / 100** |
| SEO | **66 / 100** — tek başarısız denetim, demo için kasıtlı `noindex` |
| First Contentful Paint | 1,4 sn |
| Largest Contentful Paint | 3,5 sn |
| Total Blocking Time | 10 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 1,4 sn |

Tam çıktılar: `lighthouse-mobile.report.html` ve `lighthouse-mobile.report.json`.

90+ mobil performans hedefi sağlandı. Bu ölçüm laboratuvar simülasyonudur; canlı p75 LCP ≤2,5 sn / INP ≤200 ms / CLS ≤0,1 hedeflerinin gerçekleştiğini kanıtlamaz. Laboratuvar LCP değeri şu an 3,5 sn'dir. INP için yeterli gerçek kullanıcı verisi gerekir.

## Yayına geçişte bekleyen gerçek bilgiler

WhatsApp numarası, açık adres, çalışma saatleri, gerçek ürünler/fotoğraflar/fiyatlar ve alan adı henüz sağlanmadı. Bu nedenle mesaj yönlendirme kapalı, site `noindex`, sitemap boş ve demo fiyatları için Product/Offer şeması yoktur. Gerçek bilgiler eklendikten sonra cihazlarda WhatsApp açılışı, gerçek canonical/sitemap ve yapılandırılmış veriler tekrar kontrol edilmelidir.
