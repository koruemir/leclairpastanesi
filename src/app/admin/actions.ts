"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { categories } from "@/data/categories";
import { parsePrice, requiredText, slugify } from "@/lib/admin-validation";
import { readProducts, saveProductOrder, updatePrices, writeProduct } from "@/lib/server/database";
import {
  clearLoginAttempts,
  consumeLoginAttempt,
  createSession,
  deleteSession,
  requireAdmin,
  requireSameOrigin,
  SESSION_COOKIE,
  SESSION_SECONDS,
  verifyPassword,
} from "@/lib/server/auth";
import { removePhoto, savePhoto } from "@/lib/server/uploads";
import type { Product } from "@/lib/types";
export type ActionResult = { error?: string; success?: string };
const failure = (error: unknown): ActionResult => ({
  error:
    error instanceof Error && !("code" in error)
      ? error.message
      : "İşlem kaydedilemedi. Lütfen tekrar deneyin.",
});
export async function loginAction(_: ActionResult, data: FormData): Promise<ActionResult> {
  try {
    await requireSameOrigin();
    if (!process.env.ADMIN_PASSWORD) throw new Error("Yönetici şifresi henüz yapılandırılmadı.");
    if (!consumeLoginAttempt())
      throw new Error("Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin.");
    const password = data.get("password");
    if (typeof password !== "string" || password.length > 1024 || !verifyPassword(password))
      throw new Error("Şifre hatalı.");
    clearLoginAttempts();
    (await cookies()).set(SESSION_COOKIE, createSession(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
  } catch (error) {
    return failure(error);
  }
  redirect("/admin");
}
export async function logoutAction() {
  await requireSameOrigin();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);
  store.delete(SESSION_COOKIE);
  redirect("/admin");
}
export async function pricesAction(_: ActionResult, data: FormData): Promise<ActionResult> {
  try {
    await requireSameOrigin();
    await requireAdmin();
    const id = requiredText(data, "id", "Ürün", 100);
    const product = readProducts().find((p) => p.id === id);
    if (!product) throw new Error("Ürün bulunamadı.");
    updatePrices(
      id,
      Object.fromEntries(
        product.variants.map((v) => [v.id, parsePrice(data.get(`price:${v.id}`))]),
      ),
    );
    return { success: "Fiyatlar kaydedildi." };
  } catch (error) {
    return failure(error);
  }
}
export async function orderAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireSameOrigin();
    await requireAdmin();
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string"))
      throw new Error("Ürün sırası geçersiz.");
    saveProductOrder(ids);
    return { success: "Ürün sırası kaydedildi." };
  } catch (error) {
    return failure(error);
  }
}
export async function createProductAction(_: ActionResult, data: FormData): Promise<ActionResult> {
  let image: string | undefined;
  try {
    await requireSameOrigin();
    await requireAdmin();
    const name = requiredText(data, "name", "Ürün adı", 100);
    const subtitle = requiredText(data, "subtitle", "Kısa açıklama", 160);
    const description = requiredText(data, "description", "Açıklama", 2000);
    const category = categories.find((c) => c.slug === data.get("category"));
    if (!category) throw new Error("Kategori seçin.");
    const labels = data.getAll("variantLabel");
    const prices = data.getAll("variantPrice");
    if (!labels.length || labels.length > 10 || prices.length !== labels.length)
      throw new Error("1–10 satış seçeneği ekleyin.");
    const variants = labels.map((label, index) => {
      if (typeof label !== "string" || !label.trim() || label.trim().length > 60)
        throw new Error("Seçenek adını girin (en fazla 60 karakter).");
      return { id: randomUUID(), label: label.trim(), price: parsePrice(prices[index]) };
    });
    if (new Set(variants.map((v) => v.label.toLocaleLowerCase("tr-TR"))).size !== variants.length)
      throw new Error("Seçenek adları farklı olmalıdır.");
    const file = data.get("photo");
    if (!(file instanceof File)) throw new Error("Ürün fotoğrafını yükleyin.");
    image = await savePhoto(file);
    const existing = readProducts();
    const base = slugify(name);
    let slug = base,
      suffix = 2;
    while (existing.some((p) => p.slug === slug)) slug = `${base}-${suffix++}`;
    const product: Product = {
      id: randomUUID(),
      slug,
      name,
      subtitle,
      description,
      category: category.slug,
      image,
      imageAlt: name,
      variants,
      visible: true,
      isDemo: true,
      featured: data.get("featured") === "on",
      sortOrder: Math.max(-1, ...existing.map((p) => p.sortOrder)) + 1,
    };
    writeProduct(product);
  } catch (error) {
    if (image) await removePhoto(image);
    return failure(error);
  }
  redirect("/admin?eklendi=1");
}
