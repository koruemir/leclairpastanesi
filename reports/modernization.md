# Lecalir — tasarım ve kalite iyileştirmesi

Tarih: 22 Eylül 2026. Dal: `feat/lecalir-admin`.

## Analizden uygulamaya

| Bulunan eksik | Uygulanan değişiklik |
| --- | --- |
| Vitrinde metin/fotoğraf hiyerarşisi ve masaüstü kompozisyonu zayıftı. | Krem tipografi alanı, kemerli pasta fotoğrafı ve Lecalir mührü; daha belirgin koleksiyon, ikinci tatlı fotoğrafı, sadeleştirilmiş alt bölüm. |
| Menüde arama, müşteri sıralaması ve paylaşılabilir filtre yoktu. | Türkçe/ASCII arama, fiyat sıralaması, URL durumu, geri/ileri desteği, klavyeyle temizleme, sonuç sayısı ve boş sonuç yönlendirmesi. Kartlar sunucuda HTML olarak üretilmeye devam eder. |
| Bazı ekleme hatalarında ürün sepete girmeden başarı durumu gösterilebiliyordu. | Bekleme ve hata durumu; başarı yalnızca gerçek eklemeden sonra gösterilir. 99 adet sınırı açık mesaj verir. |
| Takılı kalan katalog isteği ve farklı sekmedeki yeni ürünler sepet tutarlılığını bozabiliyordu. | Sekiz saniye zaman aşımı, tekrar deneme, eşzamanlı istek paylaşımı, yeni ürün kimliklerini taze katalog gelene kadar koruma. |
| Fiyat kontrolü sürerken form değiştirildiğinde eski müşteri metni kullanılabilirdi. | Yenileme tamamlandıktan sonra en son form/sepet okunur; değişiklikte mesajın yeniden incelenmesi istenir. |
| SEO durumu modül yüklenirken sabitlenebiliyor, sosyal paylaşım görseli eksik kalıyordu. | İstek sırasında metadata, aynı istekte paylaşılan katalog okuması, 1200 × 630 yerel sosyal kart; açıklama ve `noindex` ilk HTML'in `head` bölümünde. |
| Standalone çıktıda normal `next start` doğru üretim önizlemesi sağlamıyordu. | Statik dosyaları hazırlayan ve `.env.local`/göreli `DATA_DIR` ayarlarını koruyan `scripts/start.mjs`. |
| Mobil okunabilirlik ve odak geri bildiriminde küçük tutarsızlıklar vardı. | Daha okunur metinler, 44 px temel kontroller, görünür odak, form klavyesinde sabit gezinmenin gizlenmesi, azaltılmış hareket desteği. |

## Doğrulama

- 23 hedefli birim/entegrasyon testi başarılı: fiyatlar, kayıt temizliği, admin oturumları, fotoğraf doğrulaması, Türkçe arama, SEO, WhatsApp metni ve kodlaması.
- Chromium + mobil WebKit: 25 mağaza uçtan uca testi başarılı. Admin testleri bu genel çalışmada veri değiştirmemek için açıkça atlanır; ikinci responsive tarama proje gereği tekrarlanmaz.
- Ayrı atılabilir SQLite dizini ve yerel HTTPS üzerinde 2 admin uçtan uca testi başarılı: fiyat, fotoğraf, sıralama, açık sepetin yeniden fiyatlanması, giriş/çıkış ve oturumsuz yazmanın reddi.
- 360, 390, 768, 1440 px: ana sayfa, menü, ürün, iletişim ve sepet yatay taşma kontrolünden geçti.
- Axe WCAG 2 A/AA ve 2.1 AA kontrolleri ana sayfa, menü, ürün, iletişim ve dolu sepette ihlal bulmadı. Admin ekranları ayrıca kontrol edildi.
- TypeScript ve üretim derlemesi başarılı. Yerel önizleme `npm run start -- --port 4170` ile standalone sunucudan sunuluyor.

## Performans

Son üretim ölçümü: `lighthouse-modern-mobile.report.html` ve `.json` (Lighthouse 12.8.2, 22 Eylül 2026, 10:01 UTC). Rapor yerel sunucuda mobil CPU/ağ benzetimidir; canlı kullanıcı verisi veya evrensel hız garantisi değildir.

| Ölçüm | Sonuç |
| --- | --- |
| Performans | 91 / 100 |
| Erişilebilirlik | 100 / 100 |
| Best Practices | 100 / 100 |
| SEO | 66 / 100 — tek başarısız denetim bilinçli `noindex` |
| FCP | 0,9 saniye |
| LCP | 3,6 saniye |
| Total Blocking Time | 10 ms |
| CLS | 0 |

Görsel çıktısı WebP; vitrin fotoğrafı erken ve yüksek öncelikle yüklenir. Altı font dosyasını fotoğrafın önüne alan preload kaldırıldı; `next/font` yerel fontları kullanılan karakterlere göre yükler ve yüklenene kadar metin görünür kalır. Böylece 90+ mobil performans hedefine ulaşıldı. Laboratuvar LCP değeri hâlâ 2,5 saniyelik canlı kullanım hedefinin üzerindedir; gerçek yayında sunucu/CDN ve ziyaretçi verisiyle ayrıca değerlendirilmelidir. TBT, INP ölçümü değildir.

## Yayın sınırları

- Ürünler, görseller ve fiyatlar hâlâ örnektir; site bilinçli olarak `noindex` kalır. Bu nedenle Lighthouse'ın indekslenebilirlik denetiminin başarısız olması beklenir.
- Gerçek WhatsApp hattı ve alan adı henüz sağlanmadı. Mesaj önizleme/kopyalama çalışır; gerçek WhatsApp gönderimi doğrulanmış sayılmaz.
- Gerçek adres, telefon, saatler ve ürünler doğrulandıktan sonra mevcut yayın kapılarıyla indeksleme açılmalıdır. Alan adı yokken Next.js'in sosyal görseller için localhost metadataBase uyarısı beklenir.
- Bu turda Docker daemon kapalıydı; container yeniden oluşturma testi tekrarlanmadı. Önceki kalıcılık doğrulaması `admin-verification.md` içindedir. Yerel üretim ve admin testleri geçti.
- Sipariş, ödeme, stok, kullanıcı hesabı ve yeni yönetim özellikleri eklenmedi.
