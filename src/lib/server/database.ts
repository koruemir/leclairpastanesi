import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { products } from "@/data/catalog";
import type { Product } from "@/lib/types";

export const dataDirectory = () =>
  resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || "data");
let database: Database.Database | undefined;
export function getDatabase() {
  if (database) return database;
  mkdirSync(dataDirectory(), { recursive: true, mode: 0o700 });
  const db = new Database(resolve(dataDirectory(), "catalog.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, sort_order INTEGER NOT NULL, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, password_hash TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL);
  `);
  db.transaction(() => {
    if (!db.prepare("SELECT value FROM settings WHERE key = 'seeded'").get()) {
      const insert = db.prepare(
        "INSERT INTO products (id, slug, sort_order, body) VALUES (?, ?, ?, ?)",
      );
      for (const product of products)
        insert.run(product.id, product.slug, product.sortOrder, JSON.stringify(product));
      db.prepare("INSERT INTO settings VALUES ('seeded', '1')").run();
    }
  })();
  database = db;
  return db;
}
export function readProducts(): Product[] {
  return (
    getDatabase()
      .prepare("SELECT body, sort_order FROM products ORDER BY sort_order, id")
      .all() as { body: string; sort_order: number }[]
  ).map((row) => ({ ...JSON.parse(row.body), sortOrder: row.sort_order }));
}
export function writeProduct(product: Product) {
  getDatabase()
    .prepare("INSERT INTO products (id, slug, sort_order, body) VALUES (?, ?, ?, ?)")
    .run(product.id, product.slug, product.sortOrder, JSON.stringify(product));
}
export function updatePrices(id: string, prices: Record<string, number>) {
  const db = getDatabase();
  db.transaction(() => {
    const product = readProducts().find((p) => p.id === id);
    if (
      !product ||
      Object.keys(prices).length !== product.variants.length ||
      product.variants.some(
        (v) =>
          !Number.isSafeInteger(prices[v.id]) || prices[v.id] < 0 || prices[v.id] > 100_000_000,
      )
    )
      throw new Error("Ürün seçeneklerini ve fiyatları kontrol edin.");
    product.variants = product.variants.map((v) => ({ ...v, price: prices[v.id] }));
    db.prepare("UPDATE products SET body = ? WHERE id = ?").run(JSON.stringify(product), id);
  })();
}
export function saveProductOrder(ids: string[]) {
  const db = getDatabase();
  db.transaction(() => {
    const products = readProducts();
    if (
      ids.length !== products.length ||
      new Set(ids).size !== ids.length ||
      products.some((p) => !ids.includes(p.id))
    )
      throw new Error("Ürün listesi değişti. Sayfayı yenileyip tekrar deneyin.");
    const update = db.prepare("UPDATE products SET sort_order = ? WHERE id = ?");
    ids.forEach((id, index) => update.run(index, id));
  })();
}
