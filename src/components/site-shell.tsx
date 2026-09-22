import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { DesktopNavigation, HeaderCart, MobileNavigation } from "@/components/navigation";
import { Botanical, Diamond } from "@/components/icons";
import { business } from "@/lib/business";

export function Wordmark({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={`wordmark ${footer ? "wordmark-footer" : ""}`}
      href="/"
      translate="no"
    >
      <span>
        Lecalir<span className="wordmark-dot">.</span>
      </span>
      <small>PASTANESİ</small>
      <span className="visually-hidden"> — ana sayfa</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <Diamond />
        <span>Hayat, paylaştıkça tatlanır.</span>
        <Link href="/menu" className="announcement-link">
          Tatlı bir mola verin <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
        <Diamond />
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <DesktopNavigation />
          <Wordmark />
          <div className="header-actions">
            <Link href="/iletisim" className="header-location">
              <MapPin size={16} aria-hidden="true" />
              {business.neighborhood}, {business.district}
            </Link>
            <HeaderCart />
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <Botanical className="footer-botanical" />
        <div className="container">
          <div className="footer-main">
            <div>
              <Wordmark footer />
              <p>
                Küçük detaylar.
                <br />
                Büyük mutluluklar.
              </p>
            </div>
            <div className="footer-links">
              <span className="eyebrow">LECALİR’İ KEŞFEDİN</span>
              <Link href="/menu">Tatlı menümüz</Link>
              <Link href="/iletisim">Bize ulaşın</Link>
              <Link href="/sepet">Sepetim</Link>
            </div>
            <div className="footer-visit">
              <span className="eyebrow">BİR TATLI MOLASINA BEKLERİZ</span>
              <p>
                Güzelce, Büyükçekmece
                <br />
                İstanbul
              </p>
              <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
                Yol tarifi alın <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Lecalir Pastanesi</span>
            <span>Örnek vitrin · Ürünler, görseller ve fiyatlar temsilidir.</span>
            <span>Sevgiyle, Güzelce’den.</span>
          </div>
        </div>
      </footer>
      <MobileNavigation />
    </>
  );
}
