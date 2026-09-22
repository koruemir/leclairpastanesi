import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addCartLine as add,
  cartTotal as total,
  money,
  resolveCart as resolve,
  sanitizeCart as sanitize,
  sanitizeStoredCart,
} from "../src/lib/cart";
import type { CartLine } from "../src/lib/types";
import { products } from "../src/data/catalog";
const getProducts = () => products;
const addCartLine = (lines: CartLine[], incoming: CartLine) => add(lines, incoming, products);
const cartTotal = (lines: CartLine[]) => total(lines, products);
const resolveCart = (lines: CartLine[]) => resolve(lines, products);
const sanitizeCart = (value: unknown) => sanitize(value, products);

test("same variant merges, different sizes remain separate, prices resolve from catalog", () => {
  let lines = addCartLine([], { productId: "p01", variantId: "4-kisilik", quantity: 1 });
  lines = addCartLine(lines, { productId: "p01", variantId: "4-kisilik", quantity: 2 });
  lines = addCartLine(lines, { productId: "p01", variantId: "6-kisilik", quantity: 1 });
  assert.equal(lines.length, 2);
  assert.equal(lines[0].quantity, 3);
  assert.equal(cartTotal(lines), 3 * 68000 + 94000);
});

test("untrusted persisted data cannot inject prices, removed products, negative or fractional quantities", () => {
  const lines = sanitizeCart([
    null,
    false,
    { productId: "deleted", variantId: "adet", quantity: 1 },
    { productId: "p01", variantId: "deleted", quantity: 1 },
    { productId: "p01", variantId: "4-kisilik", quantity: -2 },
    { productId: "p01", variantId: "4-kisilik", quantity: 1.5 },
    { productId: "p01", variantId: "4-kisilik", quantity: "2" },
    {
      productId: "p01",
      variantId: "4-kisilik",
      quantity: 2,
      price: 1,
      customerAddress: "must not persist",
    },
  ]);
  assert.deepEqual(lines, [{ productId: "p01", variantId: "4-kisilik", quantity: 2 }]);
  assert.equal(resolveCart(lines)[0].variant.price, 68000);
  assert.equal(cartTotal(lines), 136000);
  assert.deepEqual(sanitizeCart({ lines: [] }), []);
});

test("persisted duplicate lines are merged and capped at 99", () => {
  assert.deepEqual(
    sanitizeCart([
      { productId: "p03", variantId: "adet", quantity: 80 },
      { productId: "p03", variantId: "adet", quantity: 80 },
    ]),
    [{ productId: "p03", variantId: "adet", quantity: 99 }],
  );
});

test("storage from a newer tab retains valid unknown IDs until a current catalog is available", () => {
  const newLine = { productId: "new-product", variantId: "adet", quantity: 2 };
  const stored = sanitizeStoredCart([{ ...newLine, price: 1, customerName: "private" }]);
  assert.deepEqual(stored, [newLine]);
  assert.deepEqual(sanitize(stored, products), []);
  const updatedCatalog = [...products, { ...products[2], id: "new-product" }];
  assert.deepEqual(sanitize(stored, updatedCatalog), [newLine]);
});

test("hidden products and malformed storage IDs cannot become resolved cart lines", () => {
  assert.deepEqual(sanitizeStoredCart([
    { productId: "", variantId: "adet", quantity: 1 },
    { productId: "x".repeat(151), variantId: "adet", quantity: 1 },
    { productId: "p03", variantId: "adet", quantity: Number.POSITIVE_INFINITY },
  ]), []);
  assert.deepEqual(sanitize(
    [{ productId: "p03", variantId: "adet", quantity: 1 }],
    products.map((product) => ({ ...product, visible: false })),
  ), []);
});

test("money retains kuruş precision and Turkish formatting", () => {
  assert.equal(money(9500), "₺95");
  assert.equal(money(123456), "₺1.234,56");
  assert.equal(cartTotal([]), 0);
});

test("every sample product has a unique address and a valid integer-priced variant", () => {
  const products = getProducts();
  assert.equal(products.length, 12);
  assert.equal(new Set(products.map((product) => product.slug)).size, 12);
  for (const product of products) {
    assert.ok(product.isDemo);
    assert.ok(product.variants.length);
    for (const variant of product.variants)
      assert.ok(Number.isInteger(variant.price) && variant.price > 0);
  }
});
