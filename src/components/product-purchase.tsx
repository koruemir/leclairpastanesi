"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantitySelector } from "@/components/quantity-selector";
import { MAX_QUANTITY, money } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { add, ready, lines } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((item) => item.id === variantId)!;
  const existing =
    lines.find((line) => line.productId === product.id && line.variantId === variantId)?.quantity ??
    0;
  const wouldExceed = existing + quantity > MAX_QUANTITY;
  return (
    <div className="product-purchase">
      <div className="detail-price-row">
        <span className="detail-price">{money(variant.price)}</span>
        <span>{variant.label}</span>
      </div>
      <fieldset className="variant-fieldset">
        <legend>Boyut / paket</legend>
        <div className="variant-options">
          {product.variants.map((option) => (
            <label
              key={option.id}
              className={`variant-option ${variant.id === option.id ? "checked" : ""}`}
            >
              <input
                className="visually-hidden"
                type="radio"
                name={`variant-${product.id}`}
                checked={variant.id === option.id}
                onChange={() => {
                  setVariantId(option.id);
                  setAdded(false);
                }}
              />
              <span>{option.label}</span>
              <span className="variant-dot" />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="purchase-actions">
        <QuantitySelector
          quantity={quantity}
          onChange={(value) => {
            setQuantity(value);
            setAdded(false);
          }}
          label={product.name}
        />
        <button
          className="button button-green"
          disabled={!ready || wouldExceed}
          onClick={() => {
            add({ productId: product.id, variantId: variant.id, quantity }, product.name);
            setAdded(true);
          }}
        >
          <ShoppingBag size={19} />
          Sepete Ekle <span className="purchase-total">{money(variant.price * quantity)}</span>
        </button>
      </div>
      {wouldExceed && (
        <p className="field-hint">Aynı ürün ve seçenekten sepette en fazla 99 adet bulunabilir.</p>
      )}
      {added && (
        <Link href="/sepet" className="added-link">
          Sepetinize eklendi · Sepeti Gör <ArrowRight size={16} />
        </Link>
      )}
      <p className="purchase-note">
        Sepetinizi tamamlayın, sipariş talebinizi WhatsApp’tan iletin.
      </p>
    </div>
  );
}
