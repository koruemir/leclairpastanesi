import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("delivery, validation, preview, copy and pickup address isolation", async ({
  page,
  browserName,
}) => {
  await page.goto("/menu");
  await page.getByRole("button", { name: "Çikolatalı Ekler sepete ekle", exact: true }).click();
  await page.goto("/sepet");
  await expect(page.getByTestId("cart-total")).toHaveText("₺95");
  await page.getByRole("button", { name: "Sipariş Mesajını Önizle" }).click();
  await expect(page.getByText("Lütfen adınızı ve soyadınızı yazın.")).toBeVisible();
  await expect(page.getByLabel("Ad soyad")).toBeFocused();
  await page.getByLabel("Ad soyad").fill("Örnek Müşteri");
  await page.getByLabel("Mahalle", { exact: false }).fill("Güzelce");
  await page.getByLabel("Açık adres").fill("Örnek Sokak No: 1/2");
  await page.getByLabel("Sipariş notu").fill("Çay saati için, teşekkürler.");
  await page.getByRole("button", { name: "Sipariş Mesajını Önizle" }).click();
  const preview = page.getByRole("textbox", { name: "WhatsApp sipariş mesajı" });
  await expect(preview).toHaveValue(/Örnek Sokak No: 1\/2/);
  await expect(preview).toHaveValue(/Ürün toplamı: ₺95/);
  await expect(page.getByRole("button", { name: "WhatsApp’tan Sipariş Ver" })).toBeDisabled();
  if (browserName === "chromium") {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: "Mesajı Kopyala" }).click();
    await expect(page.getByText("Mesaj kopyalandı.", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "Örnek Sokak No: 1/2",
    );
  }
  await page.getByRole("radio", { name: "Mağazadan alım" }).check();
  await expect(page.getByLabel("Açık adres")).toHaveCount(0);
  await expect(preview).toHaveValue(/Mağazadan teslim alma/);
  await expect(preview).not.toHaveValue(/Örnek Sokak/);
  await expect(preview).not.toHaveValue(/Mahalle:/);
  const storage = await page.evaluate(() => localStorage.getItem("lecalir-cart-v1"));
  expect(storage).not.toContain("Müşteri");
  expect(storage).not.toContain("Örnek Sokak");
  await page.reload();
  await expect(page.getByTestId("cart-total")).toHaveText("₺95");
  await expect(page.getByLabel("Ad soyad")).toBeEmpty();
  await page
    .getByRole("button", { name: "Çikolatalı Ekler 1 adet sepetten çıkar", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Tatlı kutunuz sizi bekliyor." })).toBeVisible();
});

test("product sizes stay distinct; quantities recalculate and survive refresh", async ({
  page,
}) => {
  await page.goto("/urun/frambuazli-entremet");
  await page.getByRole("button", { name: /^Sepete Ekle/ }).click();
  await page.getByRole("radio", { name: "6 kişilik" }).check();
  await page
    .getByRole("button", { name: "Frambuazlı Entremet miktarını artır", exact: true })
    .click();
  await page.getByRole("button", { name: /^Sepete Ekle/ }).click();
  await page.goto("/sepet");
  await expect(page.getByTestId("cart-total")).toHaveText("₺2.560");
  await page
    .getByRole("button", { name: "Frambuazlı Entremet 6 kişilik miktarını azalt", exact: true })
    .click();
  await expect(page.getByTestId("cart-total")).toHaveText("₺1.620");
  await page.reload();
  await expect(page.getByTestId("cart-total")).toHaveText("₺1.620");
  await expect(page.locator(".cart-line")).toHaveCount(2);
});

test("broken persisted cart recovers without breaking the catalog", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lecalir-cart-v1", "{broken"));
  await page.goto("/sepet");
  await expect(page.getByRole("heading", { name: "Tatlı kutunuz sizi bekliyor." })).toBeVisible();
  await page.goto("/menu/tatlilar");
  await expect(page.locator(".product-card")).toHaveCount(3);
});

test("menu and product HTML is crawlable, demo has noindex, invalid product returns 404", async ({
  request,
}) => {
  const menu = await request.get("/menu", {
    headers: { "user-agent": "Mozilla/5.0 Chrome/146.0.0.0 Safari/537.36" },
  });
  expect(menu.status()).toBe(200);
  const html = await menu.text();
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  expect(head).toContain('name="description"');
  expect(head).toContain('name="robots" content="noindex, follow"');
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).toContain("Frambuazlı Entremet");
  expect(html).not.toContain('"@type":"Offer"');
  const product = await request.get("/urun/cikolatali-ekler");
  expect(await product.text()).toContain("Hafif hamur, yumuşak vanilyalı krema");
  const missing = await request.get("/urun/boyle-bir-tatli-yok");
  expect(missing.status()).toBe(404);
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).not.toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("<loc>");
});

test("representative pages have no serious accessibility violations", async ({ page }) => {
  for (const path of ["/", "/menu", "/urun/frambuazli-entremet", "/iletisim"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations,
      `${path}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
  await page.goto("/menu");
  await page.getByRole("button", { name: "Çikolatalı Ekler sepete ekle", exact: true }).click();
  await page.goto("/sepet");
  await expect(page.getByLabel("Ad soyad")).toBeVisible();
  const cartResult = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(cartResult.violations).toEqual([]);
});

test("all requested breakpoints fit without page overflow", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Single responsive sweep covers all four requested widths.",
  );
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/menu", "/urun/frambuazli-entremet", "/iletisim", "/sepet"]) {
      await page.goto(path);
      const dims = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dims.content, `${path} at ${width}px`).toBeLessThanOrEqual(dims.viewport);
      if ((width === 390 || width === 1440) && (path === "/" || path === "/menu")) {
        await page.screenshot({
          path: `reports/modern-${path === "/" ? "home" : "menu"}-${width}.png`,
          fullPage: false,
        });
      }
    }
  }
});
