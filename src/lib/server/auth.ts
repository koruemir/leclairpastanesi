import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getDatabase } from "./database";

export const SESSION_COOKIE = "lecalir_admin";
export const SESSION_SECONDS = 8 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export function verifyPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(
    password && timingSafeEqual(Buffer.from(hash(input)), Buffer.from(hash(password))),
  );
}
export function createSession(now = Date.now()) {
  if (!process.env.ADMIN_PASSWORD) throw new Error("Yönetici girişi yapılandırılmadı.");
  const token = randomBytes(32).toString("hex");
  const db = getDatabase();
  db.prepare("DELETE FROM sessions WHERE expires <= ? OR password_hash != ?").run(
    now,
    hash(process.env.ADMIN_PASSWORD),
  );
  db.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(
    hash(token),
    hash(process.env.ADMIN_PASSWORD),
    now + SESSION_SECONDS * 1000,
  );
  return token;
}
export function validSession(token?: string, now = Date.now()) {
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !process.env.ADMIN_PASSWORD) return false;
  return Boolean(
    getDatabase()
      .prepare(
        "SELECT token_hash FROM sessions WHERE token_hash = ? AND password_hash = ? AND expires > ?",
      )
      .get(hash(token), hash(process.env.ADMIN_PASSWORD), now),
  );
}
export function deleteSession(token: string) {
  getDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hash(token));
}
export async function isAdmin() {
  return validSession((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Oturumunuz sona erdi. Yeniden giriş yapın.");
}
export async function requireSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin || new URL(origin).host !== host)
    throw new Error("İstek doğrulanamadı. Sayfayı yeniden açın.");
}
// A single administrator uses a global, persistent bucket: spoofed proxy headers cannot bypass it.
export function consumeLoginAttempt(now = Date.now()) {
  const db = getDatabase();
  return db.transaction(() => {
    db.prepare("DELETE FROM login_attempts WHERE expires <= ?").run(now);
    const row = db.prepare("SELECT attempts FROM login_attempts WHERE key = 'admin'").get() as
      { attempts: number } | undefined;
    if (row && row.attempts >= 5) return false;
    db.prepare(
      "INSERT INTO login_attempts VALUES ('admin', 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1",
    ).run(now + 15 * 60 * 1000);
    return true;
  })();
}
export function clearLoginAttempts() {
  getDatabase().prepare("DELETE FROM login_attempts WHERE key = 'admin'").run();
}
