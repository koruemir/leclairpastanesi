import Image from "next/image";
import Link from "next/link";
import { CakeSlice, Cookie, Croissant, Grid2X2, Cake } from "lucide-react";
import { categories } from "@/data/categories";
import { money } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { QuickAdd } from "@/components/quick-add";

const categoryIcons = { cake: Cake, dessert: CakeSlice, baklava: Croissant, cookie: Cookie };

export function CategoryNavigation({
  active = "",
  home = false,
}: {
  active?: string;
  home?: boolean;
}) {
  return (
    <nav
      className={`category-nav ${home ? "category-nav-home" : ""}`}
      aria-label="Ürün kategorileri"
    >
      <Link
        href="/menu"
        className={!active ? "category-pill selected" : "category-pill"}
        aria-current={!active ? "page" : undefined}
      >
        <Grid2X2 size={20} aria-hidden="true" />
        <span>Tümü</span>
      </Link>
      {categories.map((category) => {
        const Icon = categoryIcons[category.icon];
        return (
          <Link
            key={category.slug}
            href={`/menu/${category.slug}`}
            className={`category-pill ${active === category.slug ? "selected" : ""}`}
            aria-current={active === category.slug ? "page" : undefined}
          >
            <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
            <span>{category.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];
  return (
    <article className="product-card">
      <Link
        className="product-image-link"
        href={`/urun/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 639px) calc((100vw - 44px) / 2), (max-width: 1023px) 30vw, 282px"
          className={`product-image ${product.id === "p05" ? "image-cake" : ""}`}
        />
        {product.badge && <span className="product-badge">{product.badge}</span>}
      </Link>
      <div className="product-info">
        <span className="product-category">
          {categories.find((category) => category.slug === product.category)?.name}
        </span>
        <Link href={`/urun/${product.slug}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        <p className="product-subtitle">{product.subtitle}</p>
        <div className="product-bottom">
          <div>
            <span className="product-price">{money(variant.price)}</span>
            <span className="product-unit">{variant.label}</span>
          </div>
          <QuickAdd productId={product.id} variantId={variant.id} name={product.name} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
