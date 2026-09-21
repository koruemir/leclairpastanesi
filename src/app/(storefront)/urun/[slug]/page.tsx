import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Gift, MapPin, PackageCheck } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductGrid } from "@/components/catalog";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductStructuredData } from "@/components/structured-data";
import { getCategory, getProductBySlug, getProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return product
    ? pageMetadata(
        product.name,
        `${product.subtitle} ${product.description} Lecalir Pastanesi, Güzelce.`,
        `/urun/${slug}`,
      )
    : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const category = getCategory(product.category)!;
  const related = getProducts(product.category)
    .filter((item) => item.id !== product.id)
    .slice(0, 4);
  return (
    <div className="container product-page">
      <Breadcrumb
        items={[
          { name: "Menü", href: "/menu" },
          { name: category.name, href: `/menu/${category.slug}` },
          { name: product.name, href: `/urun/${slug}` },
        ]}
      />
      <ProductStructuredData product={product} />
      <section className="product-detail">
        <div className="detail-photo">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 767px) 100vw, 600px"
            className={product.id === "p05" ? "image-cake" : ""}
          />
          {product.badge && <span className="detail-badge">{product.badge}</span>}
          <span className="photo-caption">Örnek ürün görseli</span>
        </div>
        <div className="detail-content">
          <Link href={`/menu/${category.slug}`} className="eyebrow">
            LECALİR · {category.name.toLocaleUpperCase("tr-TR")}
          </Link>
          <h1>{product.name}</h1>
          <p className="detail-subtitle">{product.subtitle}</p>
          <p className="detail-description">{product.description}</p>
          <ProductPurchase product={product} />
          <div className="detail-perks">
            <span>
              <Gift size={20} strokeWidth={1.4} />
              Paylaşmalık mutluluk
            </span>
            <span>
              <PackageCheck size={20} strokeWidth={1.4} />
              Paket servis
            </span>
            <span>
              <MapPin size={20} strokeWidth={1.4} />
              Mağazadan alım
            </span>
          </div>
          <p className="detail-demo">
            Ürün ve fiyat bilgileri temsilidir. İçerik ve alerjen bilgilerini sipariş öncesinde
            mağazayla teyit edin.
          </p>
        </div>
      </section>
      <section className="related-section" aria-labelledby="related-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BİR TATLI DAHA?</span>
            <h2 id="related-title">
              Bunları da <em>sevebilirsiniz.</em>
            </h2>
          </div>
          <Link className="text-link" href={`/menu/${category.slug}`}>
            Tümünü gör <ArrowUpRight size={17} />
          </Link>
        </div>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
