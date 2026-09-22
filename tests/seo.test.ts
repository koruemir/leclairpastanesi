import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { business } from "../src/lib/business";
import { canIndex, pageMetadata } from "../src/lib/seo";
import { getDatabase, readProducts } from "../src/lib/server/database";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";

const directory = mkdtempSync(join(tmpdir(), "lecalir-seo-test-"));
process.env.DATA_DIR = directory;
const originalBusiness = { ...business };
after(() => {
  Object.assign(business, originalBusiness);
  getDatabase().close();
  rmSync(directory, { recursive: true, force: true });
});

test("demo pages stay crawlable but unindexed, with no fabricated canonical or sitemap", () => {
  Object.assign(business, { liveRequested: false, verified: false, siteUrl: "" });
  const metadata = pageMetadata("Menü", "Tatlıları keşfedin.", "/menu");
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.equal(metadata.alternates, undefined);
  assert.ok(metadata.twitter && "card" in metadata.twitter);
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.deepEqual(sitemap(), []);
  assert.deepEqual(robots(), { rules: { userAgent: "*", allow: "/" } });
});

test("indexing follows current catalog data and excludes checkout and admin", () => {
  Object.assign(business, {
    liveRequested: true,
    verified: true,
    siteUrl: "https://bakery.example",
    address: "Test fixture address",
    phone: "+902120000000",
  });
  assert.equal(canIndex(), false, "seed products are still placeholders");

  const db = getDatabase();
  const update = db.prepare("UPDATE products SET body = ? WHERE id = ?");
  for (const product of readProducts()) {
    update.run(JSON.stringify({ ...product, isDemo: false }), product.id);
  }
  assert.equal(canIndex(), true);
  const menuMetadata = pageMetadata("Menü", "Tatlılar", "/menu");
  assert.deepEqual(menuMetadata.robots, { index: true, follow: true });
  assert.equal(menuMetadata.alternates?.canonical, "https://bakery.example/menu");
  assert.deepEqual(pageMetadata("Sepet", "Sepet", "/sepet", true).robots, {
    index: false,
    follow: true,
  });
  const urls = sitemap().map((entry) => entry.url);
  assert.ok(urls.includes("https://bakery.example/urun/cikolatali-ekler"));
  assert.ok(urls.every((url) => !url.includes("/admin") && !url.includes("/sepet")));
  assert.equal(robots().sitemap, "https://bakery.example/sitemap.xml");

  const first = readProducts()[0];
  update.run(JSON.stringify({ ...first, isDemo: true }), first.id);
  assert.equal(canIndex(), false, "new demo content must immediately close indexing");
  assert.deepEqual(sitemap(), []);
});
