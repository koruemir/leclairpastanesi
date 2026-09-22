import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { CategoryNavigation, ProductCard } from "@/components/catalog";
import { MenuExplorer } from "@/components/menu-explorer";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";
import { createProductSearchItems } from "@/lib/product-search";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return getCategories().map((category) => ({ kategori: category.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  const category = getCategory(kategori);
  if (!category) return {};
  return pageMetadata(
    category.name,
    `${category.description} Lecalir Pastanesi, Güzelce Büyükçekmece.`,
    `/menu/${kategori}`,
  );
}

export default async function CategoryPage({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  const category = getCategory(kategori);
  if (!category) notFound();
  const products = getProducts(kategori);
  return (
    <div className="container menu-page">
      <Breadcrumb
        items={[
          { name: "Menü", href: "/menu" },
          { name: category.name, href: `/menu/${kategori}` },
        ]}
      />
      <div className="page-intro">
        <span className="eyebrow">LECALİR VİTRİNİNDEN</span>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </div>
      <CategoryNavigation active={kategori} />
      <MenuExplorer title={category.name} items={createProductSearchItems(products)}>
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </MenuExplorer>
      <p className="sample-note">Örnek vitrin · Ürünler, görseller ve fiyatlar temsilidir.</p>
    </div>
  );
}
