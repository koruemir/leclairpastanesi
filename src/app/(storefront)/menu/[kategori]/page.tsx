import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { CategoryNavigation, ProductGrid } from "@/components/catalog";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";
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
      <div className="catalog-count">
        <strong>{category.name}</strong>
        <span>{products.length} tatlı seçenek</span>
      </div>
      <ProductGrid products={products} />
      <p className="sample-note">Örnek vitrin · Ürünler, görseller ve fiyatlar temsilidir.</p>
    </div>
  );
}
