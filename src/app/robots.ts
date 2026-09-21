import type { MetadataRoute } from "next";
import { business } from "@/lib/business";
import { canIndex } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(canIndex() ? { sitemap: `${business.siteUrl}/sitemap.xml` } : {}),
  };
}

export const dynamic = "force-dynamic";
