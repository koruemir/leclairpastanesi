import { Breadcrumb } from "@/components/breadcrumb";
import { CategoryNavigation, ProductGrid } from "@/components/catalog";
import { getProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Tatlı menümüz",
  "Lecalir Pastanesi menüsü: pastalar, ekler, meyveli tatlılar, fıstıklı baklavalar ve kurabiyeler. Güzelce Büyükçekmece’de paket servis ve mağazadan alım.",
  "/menu",
);

export default function MenuPage() {
  const products = getProducts();
  return (
    <div className="container menu-page">
      <Breadcrumb items={[{ name: "Menü", href: "/menu" }]} />
      <div className="page-intro">
        <span className="eyebrow">LECALİR’İN TATLI DÜNYASI</span>
        <h1>
          Biraz keyif, <em>biraz mutluluk.</em>
        </h1>
        <p>
          En sevdiğiniz klasiği ya da yeni bir tatlı molasını keşfedin.
          <br />
          Her kutuda, paylaşılacak bir mutluluk var.
        </p>
      </div>
      <CategoryNavigation />
      <div className="catalog-count">
        <strong>Tüm lezzetler</strong>
        <span>{products.length} tatlı seçenek</span>
      </div>
      <ProductGrid products={products} />
      <p className="sample-note">Örnek vitrin · Ürünler, görseller ve fiyatlar temsilidir.</p>
    </div>
  );
}
