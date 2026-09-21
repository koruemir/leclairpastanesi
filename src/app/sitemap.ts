import type { MetadataRoute } from "next";
import { business } from "@/lib/business";
import { getCategories, getProducts } from "@/lib/catalog";
import { canIndex } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!canIndex()) return [];
  return [
    "/",
    "/menu",
    "/iletisim",
    ...getCategories().map((category) => `/menu/${category.slug}`),
    ...getProducts().map((product) => `/urun/${product.slug}`),
  ].map((path) => ({ url: `${business.siteUrl}${path}` }));
}

export const dynamic = "force-dynamic";
