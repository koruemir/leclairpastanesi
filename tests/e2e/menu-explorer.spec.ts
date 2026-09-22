import { test, expect } from "@playwright/test";

test("menu search handles Turkish characters, empty results and keyboard clearing", async ({ page }) => {
  await page.goto("/menu");
  const cards = page.locator(".product-card");
  const initialCount = await cards.count();
  expect(initialCount).toBeGreaterThan(1);
  const search = page.getByRole("searchbox", { name: "Tatlı ara" });
  await search.fill("CIKOLATALI EKLER");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Çikolatalı Ekler");
  await expect(page).toHaveURL(/q=CIKOLATALI\+EKLER/);
  await search.fill("bulunmayan-lezzet-xyz");
  await expect(cards).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Bu lezzeti henüz bulamadık." })).toBeVisible();
  await page.locator(".menu-empty").getByRole("button", { name: "Aramayı temizle" }).click();
  await expect(search).toBeFocused();
  await expect(cards).toHaveCount(initialCount);
  await search.fill("FISTIK");
  await expect(cards.first()).toBeVisible();
  await search.press("Escape");
  await expect(search).toBeEmpty();
  await expect(cards).toHaveCount(initialCount);
});

test("sorting follows displayed prices and survives reload and browser history", async ({ page }) => {
  await page.goto("/menu");
  const originalNames = await page.locator(".product-title").allTextContents();
  const sort = page.getByLabel("Sıralama", { exact: true });
  await sort.selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  const prices = await page.locator(".product-price").allTextContents();
  const amounts = prices.map((price) => Number(price.replace(/[^\d,]/g, "").replace(",", ".")));
  expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
  await page.reload();
  await expect(sort).toHaveValue("price-asc");
  await sort.selectOption("price-desc");
  await page.goBack();
  await expect(sort).toHaveValue("price-asc");
  await page.goForward();
  await expect(sort).toHaveValue("price-desc");
  await sort.selectOption("recommended");
  await expect(page.locator(".product-title")).toHaveText(originalNames);
});

test("a shared search URL renders its matching product in the initial HTML", async ({ page, request }) => {
  const path = "/menu?q=cikolatali+ekler&sort=price-asc";
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const renderedCards = html.match(/<article class="product-card">[\s\S]*?<\/article>/g) || [];
  expect(renderedCards).toHaveLength(1);
  expect(renderedCards[0]).toContain("Çikolatalı Ekler");
  await page.goto(path);
  await expect(page.getByRole("searchbox", { name: "Tatlı ara" })).toHaveValue("cikolatali ekler");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("navigation", { name: "Ürün kategorileri" }).getByRole("link", { name: "Tatlılar", exact: true }).click();
  await expect(page).toHaveURL(/\/menu\/tatlilar$/);
  await expect(page.getByRole("searchbox", { name: "Tatlı ara" })).toBeEmpty();
  await expect(page.locator(".product-card")).toHaveCount(3);
});
