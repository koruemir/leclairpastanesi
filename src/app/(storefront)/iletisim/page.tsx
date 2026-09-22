import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Phone, Store, Truck } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Botanical, Diamond } from "@/components/icons";
import { BakeryStructuredData } from "@/components/structured-data";
import { business } from "@/lib/business";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata(
    "İletişim ve konum",
    "Lecalir Pastanesi İstanbul Güzelce, Büyükçekmece’de. Mağazanın konumuna ulaşın; paket servis veya mağazadan teslim alma seçeneklerini keşfedin.",
    "/iletisim",
  );
}

export default function ContactPage() {
  return (
    <div className="container contact-page">
      <Breadcrumb items={[{ name: "İletişim", href: "/iletisim" }]} />
      <BakeryStructuredData />
      <div className="page-intro">
        <span className="eyebrow">GÜZELCE’DEN, SEVGİYLE</span>
        <h1>
          Bir tatlı molasına <em>bekleriz.</em>
        </h1>
        <p>
          Bazen bir pasta, bazen küçük bir ekler.
          <br />
          Gününüzü güzelleştirmek için buradayız.
        </p>
      </div>
      <div className="contact-layout">
        <section className="location-card" aria-labelledby="location-title">
          <Botanical className="location-botanical" />
          <span className="location-pin">
            <MapPin size={39} strokeWidth={1.1} />
          </span>
          <span className="eyebrow">İSTANBUL · BÜYÜKÇEKMECE</span>
          <h2 id="location-title">
            Güzelce’de
            <br />
            <em>tatlı bir durak.</em>
          </h2>
          <Diamond />
          <p>{business.address || "Güzelce, Büyükçekmece, İstanbul"}</p>
          <a
            href={business.mapsUrl}
            className="button button-green"
            target="_blank"
            rel="noopener noreferrer"
          >
            Yol Tarifi Al <ArrowUpRight size={18} />
          </a>
          <span className="location-caption">Konumu Google Maps’te açar.</span>
        </section>
        <section className="contact-details" aria-labelledby="contact-options">
          <h2 id="contact-options">Nasıl buluşalım?</h2>
          <div className="contact-option">
            <Store size={25} strokeWidth={1.3} />
            <div>
              <h3>Mağazadan teslim alın</h3>
              <p>
                Sepetinizi oluşturun, talebinizi WhatsApp’tan iletin. Teslim zamanını netleştirip
                Güzelce’deki mağazamıza uğrayın.
              </p>
            </div>
          </div>
          <div className="contact-option">
            <Truck size={25} strokeWidth={1.3} />
            <div>
              <h3>Kapınıza bir tatlı gelsin</h3>
              <p>
                Paket servis seçeneğiyle adresinizi paylaşın. Bölgenize teslimat uygunluğu, ücret ve
                süreyi WhatsApp’ta konuşalım.
              </p>
            </div>
          </div>
          <div className="contact-option">
            <Clock3 size={25} strokeWidth={1.3} />
            <div>
              <h3>Ziyaretinizi planlayın</h3>
              {business.hours.length ? (
                <ul>
                  {business.hours.map((hours) => (
                    <li key={hours}>{hours}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  Çalışma saatleri henüz eklenmedi. Ziyaret öncesinde güncel saatleri mağazayla
                  teyit edin.
                </p>
              )}
            </div>
          </div>
          {business.phone && (
            <div className="contact-option">
              <Phone size={25} strokeWidth={1.3} />
              <div>
                <h3>Bizi arayın</h3>
                <a href={`tel:${business.phone}`}>{business.phone}</a>
              </div>
            </div>
          )}
          <Link href="/menu" className="button button-outline">
            Önce tatlılara bakalım <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
      <p className="sample-note">
        Bu vitrin örnek içerikle hazırlanmıştır. İletişim bilgileri doğrulandıkça güncellenecektir.
      </p>
    </div>
  );
}
