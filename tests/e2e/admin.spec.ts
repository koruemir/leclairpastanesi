import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("admin login, prices, stale cart, uploads, order and authorization", async ({
  page,
  browser,
  request,
}, info) => {
  test.skip(
    !process.env.ADMIN_E2E_PASSWORD || info.project.name !== "desktop-chromium",
    "Run explicitly against a disposable database with ADMIN_E2E_PASSWORD.",
  );
  test.setTimeout(90_000);
  await page.goto("/admin/yeni");
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByLabel("Yönetici şifresi").fill("incorrect");
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await expect(page.getByText("Şifre hatalı.")).toBeVisible();
  await page.getByLabel("Yönetici şifresi").fill(process.env.ADMIN_E2E_PASSWORD!);
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await expect(page.getByRole("heading", { name: "Ürünler & fiyatlar" })).toBeVisible();
  await expect(page).toHaveTitle(/Yönetim/);
  const cookie = (await page.context().cookies()).find((c) => c.name === "lecalir_admin")!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.secure).toBe(true);
  expect(cookie.sameSite).toBe("Lax");
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations,
  ).toEqual([]);
  const row = page
    .locator(".admin-product")
    .filter({ has: page.getByRole("heading", { name: "Çikolatalı Ekler", exact: true }) });
  await row
    .getByRole("textbox", { name: "Çikolatalı Ekler 1 adet fiyatı", exact: true })
    .fill("95");
  await row.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(row.getByText("Fiyatlar kaydedildi.")).toBeVisible();
  const shopping = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL });
  const cart = await shopping.newPage();
  await cart.goto("/urun/cikolatali-ekler");
  await cart.getByRole("button", { name: /^Sepete Ekle/ }).click();
  await cart.goto("/sepet");
  await cart.getByRole("radio", { name: "Mağazadan alım" }).check();
  await cart.getByLabel("Ad soyad").fill("Fiyat Testi");
  await cart.getByRole("button", { name: "Sipariş Mesajını Önizle" }).click();
  await expect(cart.getByLabel("WhatsApp sipariş mesajı")).toHaveValue(/₺95/);
  await row
    .getByRole("textbox", { name: "Çikolatalı Ekler 1 adet fiyatı", exact: true })
    .fill("96,50");
  const write = page.waitForRequest(
    (r) => r.method() === "POST" && Boolean(r.headers()["next-action"]),
  );
  await row.getByRole("button", { name: "Kaydet", exact: true }).click();
  const captured = await write;
  await expect(row.getByText("Fiyatlar kaydedildi.")).toBeVisible();
  const unauthorized = await request.post("/admin", {
    headers: {
      "next-action": captured.headers()["next-action"],
      "content-type": captured.headers()["content-type"],
      origin: process.env.PLAYWRIGHT_BASE_URL!,
    },
    data: captured.postDataBuffer()!,
  });
  expect(await unauthorized.text()).toContain("Oturumunuz sona erdi");
  await cart.getByRole("button", { name: "Mesajı Kopyala" }).click();
  await expect(cart.locator("p[role=alert]")).toContainText("Sipariş bilgileri güncellendi");
  await expect(cart.getByTestId("cart-total")).toHaveText("₺96,50");
  await cart.route("**/api/catalog", (route) => route.abort());
  await cart.getByRole("button", { name: "Mesajı Kopyala" }).click();
  await expect(cart.locator("p[role=alert]")).toContainText("Güncel fiyatlar alınamadı");
  await cart.unroute("**/api/catalog");
  await row
    .getByRole("textbox", { name: "Çikolatalı Ekler 1 adet fiyatı", exact: true })
    .fill("95");
  await row.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await (await request.get("/api/catalog")).json()).products.find(
          (p: { id: string }) => p.id === "p03",
        ).variants[0].price,
    )
    .toBe(9500);
  await page.getByRole("link", { name: "+ Yeni ürün" }).click();
  await page.getByLabel("Ürün adı", { exact: true }).fill("Test İncirli Tatlı");
  await page.getByRole("combobox", { name: "Kategori", exact: true }).selectOption("tatlilar");
  await page.getByLabel("Kısa açıklama").fill("Test için eklenen tatlı");
  await page.getByLabel("Detay açıklaması").fill("Kalıcı fotoğraf ve katalog testi.");
  await page.getByLabel("Ürün fotoğrafı").setInputFiles("public/images/tart.webp");
  await page.getByLabel("Seçenek 1", { exact: true }).fill("Adet");
  await page.getByLabel("Fiyat · TL").fill("125,50");
  await page.getByLabel("Ana sayfada göster").check();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Ürünü Ekle" }).click();
  await expect(page.getByText("Ürün eklendi. Menüde görüntülenebilir.")).toBeVisible();
  const added = page
    .locator(".admin-product")
    .filter({ has: page.getByRole("heading", { name: "Test İncirli Tatlı", exact: true }) });
  const href = await added.getByRole("link", { name: "Ürünü gör" }).getAttribute("href");
  const html = await request.get(href!);
  expect(html.status()).toBe(200);
  expect(await html.text()).toContain("Kalıcı fotoğraf ve katalog testi.");
  const catalog = (await (await request.get("/api/catalog")).json()).products;
  const product = catalog.find((p: { slug: string }) => href === `/urun/${p.slug}`);
  expect((await request.get(product.image)).headers()["content-type"]).toBe("image/webp");
  await added.getByRole("button", { name: /yukarı taşı/ }).click();
  await page.getByRole("button", { name: "Sıralamayı Kaydet" }).click();
  await expect(page.getByText("Ürün sırası kaydedildi.")).toBeVisible();
  const reordered = (await (await request.get("/api/catalog")).json()).products;
  expect(reordered[reordered.length - 2].id).toBe(product.id);
  await page.reload();
  await expect(
    page
      .locator(".admin-product")
      .nth(reordered.length - 2)
      .getByRole("heading"),
  ).toHaveText("Test İncirli Tatlı");
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.screenshot({ path: "reports/admin-desktop.png", fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "reports/admin-mobile.png", fullPage: false });
  await page.getByRole("button", { name: "Çıkış yap" }).click();
  await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
  const loggedOut = await request.get("/admin", {
    headers: { cookie: `lecalir_admin=${cookie.value}` },
  });
  expect(await loggedOut.text()).not.toContain("Ürünler &amp; fiyatlar");
  await shopping.close();
});

test("mobile admin keyboard login, validation and new product form", async ({ page }, info) => {
  test.skip(
    !process.env.ADMIN_E2E_PASSWORD || info.project.name !== "mobile-webkit",
    "Explicit mobile admin verification only.",
  );
  await page.goto("/admin");
  await page.getByLabel("Yönetici şifresi").fill(process.env.ADMIN_E2E_PASSWORD!);
  await page.getByLabel("Yönetici şifresi").press("Enter");
  await expect(page.getByRole("heading", { name: "Ürünler & fiyatlar" })).toBeVisible();
  const row = page
    .locator(".admin-product")
    .filter({ has: page.getByRole("heading", { name: "Frambuazlı Entremet", exact: true }) });
  const price = row.getByRole("textbox", {
    name: "Frambuazlı Entremet 4 kişilik fiyatı",
    exact: true,
  });
  const original = await price.inputValue();
  await price.fill("-12");
  await row.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(row.getByText("Fiyatı 95 veya 95,50 biçiminde girin.")).toBeVisible();
  await expect(price).toHaveValue("-12");
  await price.fill(original);
  await row.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(row.getByText("Fiyatlar kaydedildi.")).toBeVisible();
  await page.getByRole("link", { name: "+ Yeni ürün" }).click();
  await page.getByRole("button", { name: "Seçenek ekle" }).click();
  await expect(page.getByLabel("Seçenek 2", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "reports/admin-new-mobile.png", fullPage: true });
  await page.getByRole("link", { name: "← Ürünlere dön" }).click();
  await page.getByRole("button", { name: "Çıkış yap" }).click();
  await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
});
