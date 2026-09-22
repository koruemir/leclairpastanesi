import { expect, test } from "@playwright/test";

test("purchase only confirms after a successful catalog-aware addition", async ({ page }) => {
  let calls = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/catalog", async (route) => {
    calls += 1;
    if (calls === 1) return route.fulfill({ json: { products: [] } });
    await new Promise<void>((resolve) => { release = resolve; });
    await route.fulfill({ status: 503, json: { error: "Unavailable" } });
  });
  await page.goto("/urun/cikolatali-ekler");
  await expect.poll(() => calls).toBe(1);
  await page.getByRole("button", { name: /^Sepete Ekle/ }).click();
  await expect(page.getByRole("button", { name: /^Ekleniyor/ })).toBeDisabled();
  await expect(page.locator(".added-link")).toHaveCount(0);
  await expect.poll(() => Boolean(release)).toBe(true);
  release!();
  await expect(page.locator('.field-error[role="alert"]')).toContainText("Fiyatlar güncellenemedi");
  await expect(page.locator(".added-link")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Sepete Ekle/ })).toBeEnabled();
});

test("a newer tab's product survives storage sync while the catalog refresh is pending", async ({ page, context, request }) => {
  const catalog = await (await request.get("/api/catalog")).json();
  const newProduct = { ...catalog.products[2], id: "newer-tab-product", name: "Yeni Ekler" };
  let currentProducts = catalog.products;
  let release: (() => void) | undefined;
  let holdRefresh = false;
  let completedRefreshes = 0;
  await page.route("**/api/catalog", async (route) => {
    if (holdRefresh) await new Promise<void>((resolve) => { release = resolve; });
    await route.fulfill({ json: { products: currentProducts } });
    completedRefreshes += 1;
  });
  await page.goto("/sepet");
  await expect(page.locator(".empty-cart")).toBeVisible();
  // Finish the initial catalog load before introducing a product unknown to this tab.
  await expect.poll(() => completedRefreshes).toBe(1);
  const other = await context.newPage();
  await other.goto("/robots.txt");
  currentProducts = [...catalog.products, newProduct];
  holdRefresh = true;
  await other.evaluate(({ productId, variantId }) => {
    localStorage.setItem("lecalir-cart-v1", JSON.stringify([{ productId, variantId, quantity: 1 }]));
  }, { productId: newProduct.id, variantId: newProduct.variants[0].id });
  await expect.poll(() => Boolean(release)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("lecalir-cart-v1"))).toContain("newer-tab-product");
  holdRefresh = false;
  release!();
  await expect(page.locator(".cart-line h3")).toHaveText("Yeni Ekler");
  await expect(page.getByTestId("cart-total")).toBeVisible();
});

test("editing checkout during a price check cannot copy an old customer message", async ({ page, request }) => {
  const catalog = await (await request.get("/api/catalog")).json();
  await page.addInitScript(() => localStorage.setItem("lecalir-cart-v1", JSON.stringify([
    { productId: "p03", variantId: "adet", quantity: 1 },
  ])));
  await page.goto("/sepet");
  await page.getByRole("radio", { name: "Mağazadan alım" }).check();
  await page.getByLabel("Ad soyad").fill("İlk Müşteri");
  await page.getByRole("button", { name: "Sipariş Mesajını Önizle" }).click();
  await expect(page.getByRole("textbox", { name: "WhatsApp sipariş mesajı" })).toHaveValue(/İlk Müşteri/);
  let release: (() => void) | undefined;
  await page.route("**/api/catalog", async (route) => {
    await new Promise<void>((resolve) => { release = resolve; });
    await route.fulfill({ json: catalog });
  });
  await page.getByRole("button", { name: "Mesajı Kopyala" }).click();
  await expect.poll(() => Boolean(release)).toBe(true);
  await page.getByLabel("Ad soyad").fill("Yeni Müşteri");
  release!();
  await expect(page.locator('.field-error[role="alert"]')).toContainText("Sipariş bilgileri güncellendi");
  await expect(page.getByRole("textbox", { name: "WhatsApp sipariş mesajı" })).toHaveValue(/Yeni Müşteri/);
  await expect(page.getByText("Mesaj kopyalandı.", { exact: true })).toHaveCount(0);
});

test("a stalled catalog request releases checkout controls with a retryable error", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem("lecalir-cart-v1", JSON.stringify([
    { productId: "p03", variantId: "adet", quantity: 1 },
  ])));
  const initialRefresh = page.waitForResponse((response) => response.url().endsWith("/api/catalog"));
  await page.goto("/sepet");
  await initialRefresh;
  await page.getByRole("radio", { name: "Mağazadan alım" }).check();
  await page.getByLabel("Ad soyad").fill("Örnek Müşteri");
  let waiting = false;
  await page.route("**/api/catalog", async () => {
    waiting = true;
    await new Promise<void>(() => {});
  });
  await page.getByRole("button", { name: "Sipariş Mesajını Önizle" }).click();
  await expect.poll(() => waiting).toBe(true);
  await expect(page.getByRole("button", { name: "Fiyatlar kontrol ediliyor…" })).toBeDisabled();
  await page.clock.fastForward(8500);
  await expect(page.locator('.field-error[role="alert"]')).toContainText("Güncel fiyatlar alınamadı");
  await expect(page.getByRole("button", { name: "Sipariş Mesajını Önizle" })).toBeEnabled();
});
