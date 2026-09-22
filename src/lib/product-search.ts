import type { Product } from "@/lib/types";

export type ProductSort = "recommended" | "price-asc" | "price-desc";

export function parseProductSort(value: string | null): ProductSort {
  return value === "price-asc" || value === "price-desc" ? value : "recommended";
}

export interface ProductSearchItem {
  id: string;
  text: string;
  price: number;
}

/** Make both Turkish keyboards and unaccented queries useful for discovery. */
export function normalizeProductQuery(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function createProductSearchItems(products: Product[]): ProductSearchItem[] {
  return products.map((product) => ({
    id: product.id,
    text: normalizeProductQuery(
      [
        product.name,
        product.subtitle,
        product.description,
        product.category,
        ...product.variants.map((variant) => variant.label),
      ].join(" "),
    ),
    // Match the displayed card price; sizes and package units vary by product.
    price: product.variants[0].price,
  }));
}

export function selectProductIndices(
  items: ProductSearchItem[],
  query: string,
  sort: ProductSort,
): number[] {
  const words = normalizeProductQuery(query).split(" ").filter(Boolean);
  const indices = items.flatMap((item, index) =>
    words.every((word) => item.text.includes(word)) ? [index] : [],
  );

  if (sort !== "recommended") {
    const direction = sort === "price-asc" ? 1 : -1;
    indices.sort(
      (a, b) => direction * (items[a].price - items[b].price) || a - b,
    );
  }
  return indices;
}
