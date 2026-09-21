import type { CartLine, Product, ResolvedCartLine } from "@/lib/types";

export const CART_STORAGE_KEY = "lecalir-cart-v1";
export const MAX_QUANTITY = 99;

export function money(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: kurus % 100 === 0 ? 0 : 2,
  }).format(kurus / 100);
}

export function sanitizeCart(value: unknown, catalog: Product[]): CartLine[] {
  if (!Array.isArray(value)) return [];
  const result: CartLine[] = [];
  for (const entry of value.slice(0, 200)) {
    if (!entry || typeof entry !== "object") continue;
    const { productId, variantId, quantity } = entry;
    if (
      typeof productId !== "string" ||
      typeof variantId !== "string" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    )
      continue;
    const product = catalog.find((item) => item.id === productId);
    if (!product?.variants.some((variant) => variant.id === variantId)) continue;
    const existing = result.find(
      (line) => line.productId === productId && line.variantId === variantId,
    );
    if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
    else result.push({ productId, variantId, quantity: Math.min(MAX_QUANTITY, quantity) });
  }
  return result;
}

export function resolveCart(lines: CartLine[], catalog: Product[]): ResolvedCartLine[] {
  return sanitizeCart(lines, catalog).map((line) => {
    const product = catalog.find((item) => item.id === line.productId)!;
    const variant = product.variants.find((item) => item.id === line.variantId)!;
    return { ...line, product, variant, subtotal: variant.price * line.quantity };
  });
}

export function cartTotal(lines: CartLine[], catalog: Product[]): number {
  return resolveCart(lines, catalog).reduce((total, line) => total + line.subtotal, 0);
}

export function addCartLine(lines: CartLine[], incoming: CartLine, catalog: Product[]): CartLine[] {
  return sanitizeCart([...lines, incoming], catalog);
}
