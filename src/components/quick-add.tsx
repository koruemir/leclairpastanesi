"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Plus } from "lucide-react";
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
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [added]);
  const maxed = lines.some(
    (line) => line.productId === productId && line.variantId === variantId && line.quantity >= 99,
  );
  return (
    <button
      className="quick-add"
      type="button"
      disabled={!ready || maxed || pending}
      aria-busy={pending}
      onClick={async () => {
        setPending(true);
        setAdded(false);
        const result = await add({ productId, variantId, quantity: 1 }, name);
        setPending(false);
        setAdded(result.ok);
      }}
      aria-label={`${name} sepete ekle`}
      title={maxed ? "En fazla 99 adet eklenebilir" : "Sepete ekle"}
    >
      {pending ? <LoaderCircle size={20} className="loading-spinner" /> : added ? <Check size={20} /> : <Plus size={22} strokeWidth={1.6} />}
    </button>
  );
}
