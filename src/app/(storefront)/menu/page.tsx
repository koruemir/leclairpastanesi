import { Breadcrumb } from "@/components/breadcrumb";
import { CategoryNavigation, ProductCard } from "@/components/catalog";
import { MenuExplorer } from "@/components/menu-explorer";
import { getProducts } from "@/lib/catalog";
import { createProductSearchItems } from "@/lib/product-search";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata(
    "Tatlı menümüz",
    "Lecalir Pastanesi menüsü: pastalar, ekler, meyveli tatlılar, fıstıklı baklavalar ve kurabiyeler. Güzelce Büyükçekmece’de paket servis ve mağazadan alım.",
    "/menu",
  );
}

export default function MenuPage() {
  const products = getProducts();
  return (
    <div className="container menu-page">
      <Breadcrumb items={[{ name: "Menü", href: "/menu" }]} />
      <div className="page-intro">
        <span className="eyebrow">LECALİR’İN TATLI DÜNYASI</span>
        <h1>
          Tatlı <em>menümüz.</em>
        </h1>
        <p>
          En sevdiğiniz klasiği ya da yeni bir lezzeti keşfedin.
        </p>
      </div>
      <CategoryNavigation />
      <MenuExplorer title="Tüm lezzetler" items={createProductSearchItems(products)}>
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </MenuExplorer>
      <p className="sample-note">Örnek vitrin · Ürünler, görseller ve fiyatlar temsilidir.</p>
    </div>
  );
}
