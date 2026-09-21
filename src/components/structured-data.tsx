import { business } from "@/lib/business";
import { canIndex } from "@/lib/seo";
import type { Product } from "@/lib/types";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function BakeryStructuredData() {
  if (!canIndex()) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Bakery",
        "@id": `${business.siteUrl}/#bakery`,
        name: business.name,
        url: business.siteUrl,
        telephone: business.phone,
        hasMap: business.mapsUrl,
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address,
          addressLocality: business.district,
          addressRegion: business.city,
          addressCountry: "TR",
          ...(business.postalCode ? { postalCode: business.postalCode } : {}),
        },
        ...(business.hours.length ? { openingHours: business.hours } : {}),
      }}
    />
  );
}

export function ProductStructuredData({ product }: { product: Product }) {
  if (!canIndex() || product.isDemo) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: `${business.siteUrl}${product.image}`,
        offers: product.variants.map((variant) => ({
          "@type": "Offer",
          name: variant.label,
          price: (variant.price / 100).toFixed(2),
          priceCurrency: "TRY",
          url: `${business.siteUrl}/urun/${product.slug}`,
        })),
      }}
    />
  );
}
