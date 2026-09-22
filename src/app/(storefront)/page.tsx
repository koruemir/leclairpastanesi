import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Coffee,
  Store,
} from "lucide-react";
import { CategoryNavigation, ProductGrid } from "@/components/catalog";
import { Botanical, Diamond, WhatsAppIcon } from "@/components/icons";
import { getProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return {
    ...pageMetadata(
      "Güzelce’de tatlı bir mola",
      "Lecalir Pastanesi, Güzelce Büyükçekmece. Pastalar, ekler, baklavalar ve kurabiyeleri keşfedin; paket servis veya mağazadan alım için WhatsApp’tan sipariş talebi oluşturun.",
      "/",
    ),
    title: { absolute: "Lecalir Pastanesi — Güzelce, Büyükçekmece" },
  };
}

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
      <section className="maison-hero container" aria-labelledby="hero-title">
        <div className="maison-copy">
          <span className="eyebrow maison-location">
            <span /> GÜZELCE · BÜYÜKÇEKMECE
          </span>
          <h1 id="hero-title">
            Hayatın en
            <br />
            <em>tatlı molası.</em>
          </h1>
          <p>
            Bir dilim pasta, küçük bir ekler, paylaşılacak bir kutu mutluluk. Kendinize tatlı bir an
            ayırın.
          </p>
          <div className="maison-actions">
            <Link className="button button-green" href="/menu">
              Tatlıları Keşfet <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <a className="text-link" href="#nasil-siparis">
              Nasıl sipariş verilir? <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="maison-service">
            <Store size={17} strokeWidth={1.4} aria-hidden="true" />
            <span>Mağazadan alım</span>
            <span className="service-dot">·</span>
            <span>Paket servis</span>
          </div>
        </div>
        <div className="maison-photo">
          <Image
            src="/images/hero.webp"
            alt="Frambuaz, çilek ve çikolata parçalarıyla süslenmiş örnek Lecalir pastası"
            fill
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            sizes="(max-width: 767px) 100vw, (max-width: 1200px) 55vw, 660px"
          />
          <span className="maison-photo-label">BİR DİLİM MUTLULUK</span>
          <div className="maison-photo-caption">
            <span>
              Çikolata, meyve
              <br />
              <em>ve biraz sihir.</em>
            </span>
            <Link href="/menu/pastalar" aria-label="Pastaları keşfet">
              <ArrowUpRight size={25} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="maison-seal" aria-hidden="true">
          <span>LECALİR</span>
          <Diamond />
          <small>TATLI ANLAR</small>
        </div>
      </section>
      <div className="container">
        <CategoryNavigation home />
      </div>
      <section
        id="vitrin"
        className="container collection-section"
        aria-labelledby="collection-title"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">LECALİR KOLEKSİYONU</span>
            <h2 id="collection-title">
              Vitrinimizden <em>seçtiklerimiz</em>
            </h2>
          </div>
          <Link className="text-link" href="/menu">
            Tüm lezzetler <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ProductGrid
          products={getProducts()
            .filter((product) => product.featured)
            .slice(0, 8)}
        />
        <p className="sample-note">
          Bu tatlı vitrin şimdilik örnek ürünler ve fiyatlarla hazırlanmıştır.
        </p>
        <div className="collection-bottom">
          <Link className="button button-outline" href="/menu">
            Menünün tamamını keşfet <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="sweet-moments container" aria-labelledby="moments-title">
        <div className="moment-photo">
          <Image
            src="/images/eclair.webp"
            alt="Çikolata kaplı eklerlerden oluşan örnek tatlı sunumu"
            fill
            sizes="(max-width: 767px) 100vw, 600px"
          />
          <span className="moment-photo-label">KÜÇÜK BİR KAÇAMAK</span>
        </div>
        <div className="moment-copy">
          <Coffee size={28} strokeWidth={1.1} aria-hidden="true" />
          <span className="eyebrow">GÜNÜN EN GÜZEL BAHANESİ</span>
          <h2>
            Kahvenizin yanında
            <br />
            <em>bir tatlı hikâye.</em>
          </h2>
          <p>
            Uzun bir sohbetin, kısa bir molanın ya da “sadece canım istedi” anının yanına. Ekler,
            tart ve profiterollerle kendinize küçük bir iyilik yapın.
          </p>
          <Link href="/menu/tatlilar" className="text-link">
            Tatlı molanı seç <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <span className="moment-signature" aria-hidden="true">
            Afiyetle, Lecalir.
          </span>
        </div>
      </section>
      <section className="order-banner container" aria-label="WhatsApp ile sipariş">
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
          Sepetini Oluştur <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </section>
      <section id="nasil-siparis" className="container how-section" aria-labelledby="how-title">
        <div className="centered-heading">
          <span className="eyebrow">SİPARİŞİN TATLI YOLU</span>
          <h2 id="how-title">Üç küçük adım.</h2>
        </div>
        <div className="steps-grid">
          <div className="step">
            <span className="step-icon">
              <ShoppingBag size={25} strokeWidth={1.3} aria-hidden="true" />
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
              <PackageCheck size={26} strokeWidth={1.3} aria-hidden="true" />
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
            <MapPin size={17} aria-hidden="true" /> Bizi ziyaret edin{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
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
