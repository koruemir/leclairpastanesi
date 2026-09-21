import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "pastalar",
    name: "Pastalar",
    icon: "cake",
    description:
      "Kutlamalara ve küçük mutluluklara eşlik eden, her dilimi ayrı bir keyif olan pastalar.",
  },
  {
    slug: "tatlilar",
    name: "Tatlılar",
    icon: "dessert",
    description:
      "Bir kahvenin yanına, günün tatlı molasına. Eklerden profiterole sevdiğiniz lezzetler.",
  },
  {
    slug: "baklavalar",
    name: "Baklavalar",
    icon: "baklava",
    description:
      "İncecik katlar, fıstığın eşsiz lezzeti. Paylaştıkça güzelleşen geleneksel tatlar.",
  },
  {
    slug: "kurabiyeler",
    name: "Kurabiyeler",
    icon: "cookie",
    description: "Çay saatlerinin küçük eşlikçileri. Bir kutu dolusu renk, kıtırlık ve mutluluk.",
  },
];

// Prices are integer kuruş. Sample content is deliberately excluded from live indexing.
