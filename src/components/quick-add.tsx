"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function QuickAdd({
  productId,
  variantId,
  name,
}: {
  productId: string;
  variantId: string;
  name: string;
}) {
  const { add, ready, lines } = useCart();
  const maxed = lines.some(
    (line) => line.productId === productId && line.variantId === variantId && line.quantity >= 99,
  );
  return (
    <button
      className="quick-add"
      type="button"
      disabled={!ready || maxed}
      onClick={() => add({ productId, variantId, quantity: 1 }, name)}
      aria-label={`${name} sepete ekle`}
      title={maxed ? "En fazla 99 adet eklenebilir" : "Sepete ekle"}
    >
      <Plus size={22} strokeWidth={1.6} />
    </button>
  );
}
