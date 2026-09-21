import assert from "node:assert/strict";
import { test } from "node:test";
import { products } from "../src/data/catalog";
import { resolveCart } from "../src/lib/cart";
import { buildOrderMessage, validateCheckout, whatsappUrl } from "../src/lib/whatsapp";
import type { CheckoutDetails } from "../src/lib/types";

const details: CheckoutDetails = {
  name: "Örnek Müşteri",
  fulfillment: "delivery",
  neighborhood: "Güzelce",
  address: "Örnek Sokak No: 1/2, Büyükçekmece",
  note: "Çikolatalı & fıstıklı, lütfen.",
};
const lines = resolveCart([{ productId: "p03", variantId: "adet", quantity: 2 }], products);

test("delivery requires name, neighborhood and address; pickup does not require address", () => {
  assert.deepEqual(validateCheckout(details), {});
  assert.deepEqual(
    Object.keys(validateCheckout({ ...details, name: " ", neighborhood: " ", address: " " })),
    ["name", "neighborhood", "address"],
  );
  assert.deepEqual(
    validateCheckout({ ...details, fulfillment: "pickup", neighborhood: "", address: "" }),
    {},
  );
});

test("delivery message includes accurate quantities and totals, address, note and sample status", () => {
  const message = buildOrderMessage(lines, details);
  assert.ok(message.includes("2 adet × ₺95 = ₺190"));
  assert.ok(message.includes("Ürün toplamı: ₺190"));
  assert.ok(message.includes("Mahalle: Güzelce"));
  assert.ok(message.includes(details.address));
  assert.ok(message.includes(details.note));
  assert.ok(message.includes("ÖRNEK SİPARİŞ"));
});

test("switching to pickup never leaks retained delivery fields", () => {
  const message = buildOrderMessage(lines, { ...details, fulfillment: "pickup" });
  assert.ok(message.includes("Mağazadan teslim alma"));
  assert.ok(!message.includes(details.address));
  assert.ok(!message.includes("Mahalle:"));
  assert.ok(!message.includes("Adres:"));
  assert.ok(!message.includes("Teslimat uygunluğu"));
});

test("WhatsApp URL roundtrips Turkish, newlines, ampersands and hash characters", () => {
  // Reserved fictional US number, used only to inspect the generated string. Never contacted.
  const message = buildOrderMessage(lines, {
    ...details,
    note: "Çığ, şeker & fıstık #1\nİkinci satır",
  });
  const url = new URL(whatsappUrl("12025550123", message)!);
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/12025550123");
  assert.equal(url.searchParams.get("text"), message);
  assert.equal(url.hash, "");
  assert.equal(Array.from(url.searchParams.keys()).length, 1);
});

test("missing or malformed numbers never produce a live recipient", () => {
  for (const phone of [
    "",
    " ",
    "+905551234567",
    "05551234567",
    "90abc",
    "https://wa.me/123",
    "1202",
    "1234567890123456",
  ])
    assert.equal(whatsappUrl(phone, "test"), null);
});

test("overlong form fields return bounded validation errors", () => {
  assert.ok(validateCheckout({ ...details, name: "a".repeat(101) }).name);
  assert.ok(validateCheckout({ ...details, address: "a".repeat(501) }).address);
  assert.ok(validateCheckout({ ...details, note: "a".repeat(501) }).note);
});
