import "server-only";
import { categories } from "@/data/categories";
import { readProducts } from "@/lib/server/database";

export function getProducts(category?: string) {
  return readProducts().filter(
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
