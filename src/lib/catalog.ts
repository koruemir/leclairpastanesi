import "server-only";
import { cache } from "react";
import { categories } from "@/data/categories";
import { readProducts } from "@/lib/server/database";

// Reuse one catalog snapshot during an RSC render, never across requests.
const readCatalog = cache(readProducts);

export function getProducts(category?: string) {
  return readCatalog().filter(
    (product) => product.visible && (!category || product.category === category),
  );
}
export function getProductBySlug(slug: string) {
  return getProducts().find((product) => product.slug === slug);
}
export function getCategories() {
  return categories;
}
export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
export function hasDemoContent() {
  return getProducts().some((product) => product.isDemo);
}
