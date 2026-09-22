import assert from "node:assert/strict";
import { test } from "node:test";
import { products } from "../src/data/catalog";
import {
  createProductSearchItems,
  normalizeProductQuery,
  parseProductSort,
  selectProductIndices,
} from "../src/lib/product-search";

test("Turkish and ASCII queries match the same product vocabulary", () => {
  assert.equal(normalizeProductQuery("  FISTIKLI, ÇİKOLATA!  "), "fistikli cikolata");
  assert.equal(normalizeProductQuery("İNCİR ŞÖLENİ"), "incir soleni");
  const items = createProductSearchItems(products);
  assert.deepEqual(
    selectProductIndices(items, "FISTIK", "recommended"),
    selectProductIndices(items, "fıstık", "recommended"),
  );
  assert.ok(selectProductIndices(items, "FISTIK", "recommended").length > 0);
  assert.equal(selectProductIndices(items, "cikolatali ekler", "recommended").length, 1);
  assert.equal(selectProductIndices(items, "bir-lezzet-bulunamadi", "recommended").length, 0);
});

test("search includes descriptions and sale options, with all query words required", () => {
  const items = createProductSearchItems(products);
  const cakeIndex = products.findIndex((product) => product.id === "p01");
  assert.ok(selectProductIndices(items, "frambuazli 6 kisilik", "recommended").includes(cakeIndex));
  assert.equal(selectProductIndices(items, "frambuazli nonexistent", "recommended").length, 0);
});

test("price sort matches card price and preserves the master order for equal prices", () => {
  const items = [
    { id: "a", text: "ekler", price: 12000 },
    { id: "b", text: "pasta", price: 9000 },
    { id: "c", text: "ekler", price: 12000 },
  ];
  const before = structuredClone(items);
  assert.deepEqual(selectProductIndices(items, "", "recommended"), [0, 1, 2]);
  assert.deepEqual(selectProductIndices(items, " ", "price-asc"), [1, 0, 2]);
  assert.deepEqual(selectProductIndices(items, "", "price-desc"), [0, 2, 1]);
  assert.deepEqual(selectProductIndices(items, "ekler", "price-asc"), [0, 2]);
  assert.deepEqual(items, before);
  assert.equal(createProductSearchItems(products)[0].price, products[0].variants[0].price);
  assert.equal(parseProductSort("price-desc"), "price-desc");
  assert.equal(parseProductSort("invalid-query-value"), "recommended");
  assert.equal(parseProductSort(null), "recommended");
});
