import type { Metadata } from "next";
import { business } from "@/lib/business";
import { hasDemoContent } from "@/lib/catalog";

const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Lecalir Pastanesi — Güzelce, Büyükçekmece",
};

export const canIndex = () =>
  Boolean(
    business.liveRequested &&
    business.verified &&
    business.siteUrl &&
    business.address &&
    business.phone &&
    !hasDemoContent(),
  );

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
): Metadata {
  return {
    title,
    description,
    ...(business.siteUrl ? { alternates: { canonical: `${business.siteUrl}${path}` } } : {}),
    robots: { index: !noindex && canIndex(), follow: true },
    openGraph: {
      title: `${title} | ${business.name}`,
      description,
      locale: "tr_TR",
      type: "website",
      siteName: business.name,
      images: [socialImage],
      ...(business.siteUrl ? { url: `${business.siteUrl}${path}` } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${business.name}`,
      description,
      images: [socialImage],
    },
  };
}
