"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/cart";

export function QuantitySelector({
  quantity,
  onChange,
  label = "Ürün",
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  label?: string;
}) {
  return (
    <div className="quantity-selector" role="group" aria-label={`${label} miktarı`}>
      <button
        type="button"
        disabled={quantity <= 1}
        aria-label={`${label} miktarını azalt`}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus size={16} />
      </button>
      <output aria-label={`${label} adet`} aria-live="polite">
        {quantity}
      </output>
      <button
        type="button"
        disabled={quantity >= MAX_QUANTITY}
        aria-label={`${label} miktarını artır`}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
