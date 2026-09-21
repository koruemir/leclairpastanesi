import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, PackageCheck, ShoppingBag } from "lucide-react";
import { CategoryNavigation, ProductGrid } from "@/components/catalog";
import { Botanical, Diamond, WhatsAppIcon } from "@/components/icons";
import { getProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata(
    "Güzelce’de tatlı bir mola",
    "Lecalir Pastanesi, Güzelce Büyükçekmece. Pastalar, ekler, baklavalar ve kurabiyeleri keşfedin; paket servis veya mağazadan alım için WhatsApp’tan sipariş talebi oluşturun.",
    "/",
  ),
  title: { absolute: "Lecalir Pastanesi — Güzelce, Büyükçekmece" },
};

const faqs = [
  [
    "Lecalir Pastanesi nerede?",
    "Mağazamız İstanbul, Büyükçekmece ilçesinin Güzelce mahallesinde. İletişim sayfamızdaki yol tarifi bağlantısıyla konumumuza ulaşabilirsiniz.",
  ],
  [
    "WhatsApp’tan nasıl sipariş verebilirim?",
    "Menüden sevdiğiniz ürünleri sepetinize ekleyin. Teslim şeklini seçip kısa formu doldurun; hazırlanan mesajı WhatsApp’ta gönderin. Ürün uygunluğu ve teslim zamanı görüşmede netleşir.",
  ],
  [
    "Paket servis ve mağazadan teslim alma var mı?",
    "Her iki seçenek de mevcut. Paket servis için mahallenizi ve adresinizi belirtin; bölgenize teslimat uygunluğu ve ücretini WhatsApp’ta netleştirelim. Dilerseniz siparişinizi Güzelce’deki mağazamızdan alın.",
  ],
  [
    "Vitrindeki fiyatlar güncel mi?",
    "Bu site şu anda örnek vitrin olarak hazırlanmıştır. Ürünler, görseller ve fiyatlar temsilidir; gerçek sipariş öncesinde ürün ve fiyat bilgileri teyit edilmelidir.",
  ],
];

export default function HomePage() {
  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-image">
          <Image
            src="/images/hero.webp"
            alt="Kırmızı meyveler ve fıstıkla süslenmiş çikolatalı Lecalir örnek pastası"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span />
            GÜZELCE’DE TATLI BİR MOLA
          </span>
          <h1 id="hero-title">
            Küçük anlara,
            <br />
            <em>büyük mutluluklar.</em>
          </h1>
          <p>
            Geleneksel lezzetler, zarif dokunuşlar.
            <br />
            Her lokmada biraz daha mutluluk.
          </p>
          <Link className="button button-cream" href="/menu">
            Tatlıları Keşfet <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="hero-note">
          Tatlı, her zaman
          <br />
          daha iyi bir fikirdir.
        </div>
        <span className="hero-caption">LECALİR’İN TATLI DÜNYASINA HOŞ GELDİNİZ</span>
      </section>
      <div className="container">
        <CategoryNavigation home />
      </div>
      <section className="container collection-section" aria-labelledby="collection-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BİR TATLI SEÇ, GÜNÜN GÜZELLEŞSİN</span>
            <h2 id="collection-title">
              Vitrinimizden <em>seçtiklerimiz</em>
            </h2>
          </div>
          <Link className="text-link" href="/menu">
            Tüm lezzetler <ArrowUpRight size={18} />
          </Link>
        </div>
        <ProductGrid products={getProducts().filter((product) => product.featured)} />
        <p className="sample-note">
          Bu tatlı vitrin şimdilik örnek ürünler ve fiyatlarla hazırlanmıştır.
        </p>
        <div className="collection-bottom">
          <Link className="button button-outline" href="/menu">
            Menünün tamamını keşfet <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="order-banner container">
        <Botanical className="banner-botanical" />
        <div className="order-banner-icon">
          <WhatsAppIcon width={38} height={38} />
        </div>
        <div className="order-banner-copy">
          <span className="eyebrow">TATLI MUTLULUKLAR BİR MESAJ UZAĞINIZDA</span>
          <h2>
            Siz seçin, <em>birlikte tatlandıralım.</em>
          </h2>
          <p>Sepetinizi oluşturun, sipariş talebinizi WhatsApp’tan iletin.</p>
        </div>
        <Link href="/menu" className="button button-green">
          Sepetini Oluştur <ArrowUpRight size={19} />
        </Link>
      </section>
      <section className="container how-section" aria-labelledby="how-title">
        <div className="centered-heading">
          <span className="eyebrow">SİPARİŞİN TATLI YOLU</span>
          <h2 id="how-title">Üç küçük adım.</h2>
        </div>
        <div className="steps-grid">
          <div className="step">
            <span className="step-icon">
              <ShoppingBag size={25} strokeWidth={1.3} />
              <small>01</small>
            </span>
            <h3>Kalbinizden geçeni seçin</h3>
            <p>
              Vitrini keşfedin, sevdiğiniz tatlıları
              <br className="desktop-break" /> sepetinize ekleyin.
            </p>
          </div>
          <div className="step">
            <span className="step-icon">
              <WhatsAppIcon width={27} height={27} />
              <small>02</small>
            </span>
            <h3>Bir mesajla buluşalım</h3>
            <p>
              Sepetinizi WhatsApp’tan paylaşın.
              <br className="desktop-break" /> Ayrıntıları birlikte netleştirelim.
            </p>
          </div>
          <div className="step">
            <span className="step-icon">
              <PackageCheck size={26} strokeWidth={1.3} />
              <small>03</small>
            </span>
            <h3>Mutluluğa yer açın</h3>
            <p>
              Paket servis isteyin veya
              <br className="desktop-break" /> Güzelce’deki mağazamızdan alın.
            </p>
          </div>
        </div>
      </section>
      <section className="faq-section container" aria-labelledby="faq-title">
        <div className="faq-intro">
          <span className="eyebrow">AKLINIZDA KALMASIN</span>
          <h2 id="faq-title">
            Küçük sorular, <br />
            <em>tatlı cevaplar.</em>
          </h2>
          <Link className="text-link" href="/iletisim">
            <MapPin size={17} /> Bizi ziyaret edin <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span className="faq-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="closing-note container">
        <span />
        <Diamond />
        <p>Tatlı, her zaman daha iyi bir fikirdir.</p>
        <Diamond />
        <span />
      </div>
    </>
  );
}
