import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { business } from "@/lib/business";
import { JsonLd } from "@/components/structured-data";

export function Breadcrumb({ items }: { items: { name: string; href?: string }[] }) {
  const all = [{ name: "Ana Sayfa", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumb" aria-label="İçerik yolu">
        {all.map((item, index) => (
          <span className="breadcrumb-item" key={item.name}>
            {index > 0 && <ChevronRight size={12} />}
            {item.href && index < all.length - 1 ? (
              <Link href={item.href}>{item.name}</Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </span>
        ))}
      </nav>
      {business.siteUrl && all.every((item) => item.href) && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: all.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: `${business.siteUrl}${item.href}`,
            })),
          }}
        />
      )}
    </>
  );
}
