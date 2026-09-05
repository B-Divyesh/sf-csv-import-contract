import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function reachHandoff(page: import("@playwright/test").Page): Promise<void> {
  await page.getByRole("button", { name: /Continue to map/ }).click();
  await page.getByRole("button", { name: /Continue to validate/ }).click();
  await page.getByRole("button", { name: /Review handoff/ }).click();
  await expect(page.getByRole("heading", { name: "Export handoff files" })).toBeVisible();
}

async function expectCompleteRouteShell(page: import("@playwright/test").Page): Promise<void> {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toBeFocused();
  const heading = (await page.locator("h1").textContent())?.trim();
  await expect(page.locator("#route-announcer")).toContainText(`${heading} page loaded.`);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /CSV Import Contract/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-preview\.jpg$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /social-preview\.jpg$/);
  const footer = page.locator("footer");
  await expect(footer).toContainText("CSV import plans for repeatable migration handoffs.");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy/");
  await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
}

test("@claim:demo-isolation keeps the sample separate from real work", async ({ page }) => {
  await page.goto("/");
  await page.locator("#source-file").setInputFiles({
    name: "real-work.csv", mimeType: "text/csv", buffer: Buffer.from("ID,Name\nR-1,Real workspace")
  });
  await expect(page.getByText("real-work.csv", { exact: true })).toBeVisible();
  await page.waitForTimeout(500);

  await page.goto("/demo/");
  await expect(page.getByLabel("Demo controls")).toContainText("Demo — sample data, nothing is saved");
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue to map/ }).click();
  const target = page.locator('[data-index="0"] input[data-field="target"]');
  await target.fill("demo_customer_id");
  await target.dispatchEvent("change");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue to map/ }).click();
  await expect(page.locator('[data-index="0"] input[data-field="target"]')).toHaveValue("customer_id");

  await page.goto("/");
  await expect(page.getByText("real-work.csv", { exact: true })).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain("csv-import-contract");
  expect(databases).toContain("demo:csv-import-contract");
});

test("@claim:local-only keeps the demo flow on the product origin", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo/");
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue to map/ }).click();
  await page.getByRole("button", { name: /Continue to validate/ }).click();
  await expect(page.getByRole("heading", { name: "Set pass / fail rules" })).toBeVisible();
  expect(requests).not.toEqual([]);
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("@claim:offline-reload reloads the sample without a network connection", async ({ page, context }) => {
  await page.goto("/?demo=1");
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await expect(page.getByLabel("Demo controls")).toContainText("Demo — sample data, nothing is saved");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel("Demo controls")).toContainText("Demo — sample data, nothing is saved");
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
});

test("@claim:handoff-exports downloads every free handoff file", async ({ page }) => {
  await page.goto("/demo/");
  await reachHandoff(page);
  const contract = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export contract" }).click();
  await expect((await contract).suggestedFilename()).toMatch(/\.import-contract\.json$/);
  const cleaned = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export cleaned CSV" }).click();
  const cleanedDownload = await cleaned;
  expect(cleanedDownload.suggestedFilename()).toMatch(/\.cleaned\.csv$/);
  expect(await cleanedDownload.createReadStream()).toBeTruthy();
  const report = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  await expect((await report).suggestedFilename()).toMatch(/\.handoff\.md$/);
  const issues = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export issues CSV" }).click();
  await expect((await issues).suggestedFilename()).toMatch(/\.issues\.csv$/);
});

test("@claim:no-production-import finishes with a local handoff instead of a remote import", async ({ page }) => {
  await page.goto("/demo/");
  await reachHandoff(page);
  const finalRequests: Array<{ method: string; url: string }> = [];
  page.on("request", (request) => finalRequests.push({ method: request.method(), url: request.url() }));

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export cleaned CSV" }).click();
  const cleaned = await downloadEvent;
  expect(cleaned.suggestedFilename()).toBe("migration-sample.cleaned.csv");
  const stream = await cleaned.createReadStream();
  expect(stream).toBeTruthy();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const contents = Buffer.concat(chunks).toString("utf8");
  expect(contents).toContain("customer_id,email,join_date,active,balance");
  expect(contents).toContain('C-001,ADA@EXAMPLE.COM,2025-01-31,yes,"1,200"');
  expect(finalRequests).toEqual([]);
});

test("has a clear first screen, working routes, accessible structure, and no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle("CSV Import Contract — Prepare CSV imports");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Prepare a CSV import contract/i);
  await expect(page.getByText("For migration teams who need another person to repeat a CSV import.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
  await page.locator("body").press("Tab");
  await expect(page.getByRole("link", { name: "Skip to workspace" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth === window.innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.getByRole("link", { name: "Try sample" }).click();
  await expect(page).toHaveURL(/\/demo\/?$/);
  await expect(page).toHaveTitle("Demo — CSV Import Contract");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.locator(".workspace").evaluate(async (workspace) => {
    await Promise.all(workspace.getAnimations().map((animation) => animation.finished));
  });
  const demoAxe = await new AxeBuilder({ page }).analyze();
  expect(demoAxe.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.getByRole("link", { name: "CSV Import Contract home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();

  await page.getByRole("link", { name: "Privacy" }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page).toHaveTitle("Privacy — CSV Import Contract");
  await expectCompleteRouteShell(page);

  await page.getByRole("link", { name: "CSV Import Contract" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Terms" }).click();
  await expect(page).toHaveURL(/\/terms\/$/);
  await expect(page).toHaveTitle("Terms — CSV Import Contract");
  await expectCompleteRouteShell(page);

  const missing = await page.request.get("/no-such-route");
  expect(missing.status()).toBe(404);
  await page.goto("/404.html");
  await expect(page.getByRole("heading", { name: "This page does not exist" })).toBeVisible();
  await expectCompleteRouteShell(page);

  await page.goto("/offline.html");
  await expect(page).toHaveTitle("Offline — CSV Import Contract");
  await expectCompleteRouteShell(page);
  expect(consoleErrors).toEqual([]);
});

test("flags impossible calendar dates and blocks approval with source evidence", async ({ page }) => {
  await page.goto("/");
  await page.locator("#source-file").setInputFiles({
    name: "calendar-regression.csv", mimeType: "text/csv", buffer: Buffer.from("Join date\n31/02/2025\n2025-02-29\n2024-02-29")
  });
  await expect(page.getByText("calendar-regression.csv", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue to map/ }).click();
  await page.getByRole("button", { name: /Continue to validate/ }).click();
  await expect(page.locator(".issue-count strong")).toHaveText("2");
  await page.getByRole("button", { name: /Review handoff/ }).click();
  await expect(page.getByText("Review required", { exact: true })).toBeVisible();
  await expect(page.locator("#approval-status option[value=approved]")).toHaveAttribute("disabled", "");
});
