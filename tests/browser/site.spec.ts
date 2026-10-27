import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage, navigation and service calls to action work", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("IntelligenceCreatesAdvantage.");
  if (isMobile) {
    const toggle = page.locator(".menu-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Services", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Services", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Strategic Intelligence");
  await page.getByRole("link", { name: "Discuss this service" }).first().click();
  await expect(page).toHaveURL(/\/contact\?service=competitive-intelligence$/);
  await expect(page.getByLabel("Service of interest")).toHaveValue("competitive-intelligence");
  expect(errors).toEqual([]);
});

test("all pages load with one main heading, metadata, and no horizontal overflow", async ({ page }) => {
  for (const route of ["/", "/about", "/services", "/industries", "/insights", "/contact", "/privacy", "/insights/why-competitive-intelligence-matters"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole("main")).toBeVisible();
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations, `Accessibility violations on ${route}`).toEqual([]);
  }
});

test("insights are drafts and article links lead to reusable article pages", async ({ page }) => {
  await page.goto("/insights");
  await expect(page.getByText("Editorial draft", { exact: true })).toHaveCount(5);
  const links = await page.locator('main a[href^="/insights/"]').evaluateAll(elements => elements.map(el => el.getAttribute("href")!));
  for (const link of links) {
    await page.goto(link);
    await expect(page.getByText("Unpublished editorial draft", { exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("article .prose section")).toHaveCount(3);
  }
});

test("unconfigured contact delivery is clearly unavailable and never claims success", async ({ page, request }) => {
  await page.goto("/contact");
  await expect(page.getByText("Inquiries are not available yet.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Inquiry" })).toBeDisabled();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveAttribute("required", "");
  await expect(page.getByLabel("Business email")).toHaveAttribute("type", "email");
  const response = await request.post("/api/contact", { data: { name: "Test Person", company: "Test Company", email: "test@example.test", phone: "", service: "not-sure", message: "This is a test inquiry checking unavailable delivery.", website: "", startedAt: Date.now() - 5000, consent: true } });
  expect(response.status()).toBe(503);
  expect((await response.json()).error).toContain("not been sent");
});

test("unknown pages return an accessible 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A different path");
  await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();
});
