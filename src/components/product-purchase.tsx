"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantitySelector } from "@/components/quantity-selector";
import { MAX_QUANTITY, money } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { add, ready, lines, products } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const currentProduct = products.find((item) => item.id === product.id) ?? product;
  const variant = currentProduct.variants.find((item) => item.id === variantId) ?? currentProduct.variants[0];
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
          {currentProduct.variants.map((option) => (
            <label
              key={option.id}
              className={`variant-option ${variant.id === option.id ? "checked" : ""}`}
            >
              <input
                className="visually-hidden"
                type="radio"
                name={`variant-${product.id}`}
                disabled={pending}
                checked={variant.id === option.id}
                onChange={() => {
                  setVariantId(option.id);
                  setAdded(false);
                  setError("");
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
            if (pending) return;
            setQuantity(value);
            setAdded(false);
            setError("");
          }}
          label={product.name}
        />
        <button
          className="button button-green"
          disabled={!ready || wouldExceed || pending}
          aria-busy={pending}
          onClick={async () => {
            setPending(true);
            setAdded(false);
            setError("");
            const result = await add({ productId: product.id, variantId: variant.id, quantity }, product.name);
            setPending(false);
            setAdded(result.ok);
            if (!result.ok) setError(result.error ?? "Ürün eklenemedi. Lütfen tekrar deneyin.");
          }}
        >
          {pending ? <LoaderCircle size={19} className="loading-spinner" /> : added ? <Check size={19} /> : <ShoppingBag size={19} />}
          {pending ? "Ekleniyor…" : "Sepete Ekle"} <span className="purchase-total">{money(variant.price * quantity)}</span>
        </button>
      </div>
      {wouldExceed && (
        <p className="field-hint">Aynı ürün ve seçenekten sepette en fazla 99 adet bulunabilir.</p>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
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
