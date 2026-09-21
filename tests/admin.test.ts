import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { parsePrice, slugify } from "../src/lib/admin-validation";
import { cartTotal } from "../src/lib/cart";
const directory = mkdtempSync(join(tmpdir(), "lecalir-admin-test-"));
process.env.DATA_DIR = directory;
process.env.ADMIN_PASSWORD = "test-password-not-for-production";
import {
  getDatabase,
  readProducts,
  saveProductOrder,
  updatePrices,
  writeProduct,
} from "../src/lib/server/database";
import {
  verifyPassword,
  createSession,
  validSession,
  deleteSession,
  consumeLoginAttempt,
  clearLoginAttempts,
} from "../src/lib/server/auth";
import { savePhoto, removePhoto } from "../src/lib/server/uploads";
after(() => {
  getDatabase().close();
  rmSync(directory, { recursive: true, force: true });
});

test("TL inputs preserve kuruş and reject malformed values", () => {
  assert.equal(parsePrice("95,50"), 9550);
  assert.equal(parsePrice("0.01"), 1);
  for (const input of ["-1", "NaN", "1e3", "1.234,56", "1.234", "", "1000001", null])
    assert.throws(() => parsePrice(input));
  assert.equal(slugify("Çığ Şöleni & İncir"), "cig-soleni-incir");
});
test("seed is idempotent, prices and order persist; cart uses supplied fresh prices", () => {
  assert.equal(readProducts().length, 12);
  updatePrices("p01", { "4-kisilik": 9550, "6-kisilik": 12500 });
  assert.equal(
    cartTotal([{ productId: "p01", variantId: "4-kisilik", quantity: 2 }], readProducts()),
    19100,
  );
  assert.throws(() => updatePrices("p01", { "4-kisilik": 50 }));
  const ids = readProducts()
    .map((p) => p.id)
    .reverse();
  saveProductOrder(ids);
  assert.deepEqual(
    readProducts().map((p) => p.id),
    ids,
  );
  assert.throws(() => saveProductOrder([...ids.slice(1), ids[1]]));
  const product = { ...readProducts()[0], id: "new-test", slug: "new-test", sortOrder: 12 };
  writeProduct(product);
  assert.equal(readProducts().length, 13);
  assert.equal(readProducts().find((p) => p.id === "p01")!.variants[0].price, 9550);
});
test("password and opaque sessions fail closed, expire, revoke and rotate", () => {
  assert.equal(verifyPassword("wrong"), false);
  assert.equal(verifyPassword(process.env.ADMIN_PASSWORD!), true);
  const now = Date.now(),
    token = createSession(now);
  assert.equal(validSession(token, now), true);
  assert.equal(validSession(token, now + 8 * 60 * 60 * 1000), false);
  assert.equal(validSession("fabricated"), false);
  deleteSession(token);
  assert.equal(validSession(token, now), false);
  const second = createSession(now);
  process.env.ADMIN_PASSWORD = "rotated-test-password";
  assert.equal(validSession(second, now), false);
  delete process.env.ADMIN_PASSWORD;
  assert.equal(verifyPassword(""), false);
  assert.equal(validSession(second), false);
  process.env.ADMIN_PASSWORD = "test-password-not-for-production";
});
test("login throttling persists across callers and expires", () => {
  clearLoginAttempts();
  const now = Date.now();
  for (let i = 0; i < 5; i++) assert.equal(consumeLoginAttempt(now), true);
  assert.equal(consumeLoginAttempt(now), false);
  assert.equal(consumeLoginAttempt(now + 15 * 60 * 1000), true);
  clearLoginAttempts();
});
test("uploads decode, resize and strip metadata; reject fake or oversized photos", async () => {
  const bytes = await sharp({
    create: { width: 1800, height: 1000, channels: 3, background: "#abcdef" },
  })
    .png()
    .toBuffer();
  const image = await savePhoto(new File([bytes], "cake.png", { type: "image/png" }));
  const metadata = await sharp(join(directory, "uploads", image.split("/").pop()!)).metadata();
  assert.equal(metadata.width, 1600);
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.exif, undefined);
  await removePhoto(image);
  await assert.rejects(savePhoto(new File(["not an image"], "fake.jpg")));
  await assert.rejects(savePhoto(new File([new Uint8Array(8 * 1024 * 1024 + 1)], "large.png")));
});
