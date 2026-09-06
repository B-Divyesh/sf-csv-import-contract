import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const xlsxFixture = Buffer.from("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", "base64");

async function downloadText(download: import("@playwright/test").Download): Promise<string> {
  const stream = await download.createReadStream();
  expect(stream).toBeTruthy();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function expectTouchTarget(locator: import("@playwright/test").Locator): Promise<void> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
}

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

test("@claim:handoff-exports downloads populated free handoff files", async ({ page }) => {
  await page.goto("/demo/");
  await reachHandoff(page);
  const contractDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export contract" }).click();
  const contract = await contractDownload;
  expect(contract.suggestedFilename()).toMatch(/\.import-contract\.json$/);
  const contractBody = JSON.parse(await downloadText(contract));
  expect(contractBody.schema).toBe("https://csv-import-contract.sociobot.in/schema/v1");
  expect(contractBody.source).toMatchObject({ fileName: "migration-sample.csv", rowCount: 3, columns: 5 });
  expect(contractBody.columns).toHaveLength(5);
  expect(contractBody.safety).toMatchObject({ preserveOriginalRowNumbers: true, deterministicTransforms: true });

  const cleanedDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export cleaned CSV" }).click();
  const cleaned = await cleanedDownload;
  expect(cleaned.suggestedFilename()).toMatch(/\.cleaned\.csv$/);
  const cleanedBody = await downloadText(cleaned);
  expect(cleanedBody).toContain("customer_id,email,join_date,active,balance");
  expect(cleanedBody).toContain('C-001,ADA@EXAMPLE.COM,2025-01-31,yes,"1,200"');

  const reportDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  const report = await reportDownload;
  expect(report.suggestedFilename()).toMatch(/\.handoff\.md$/);
  const reportBody = await downloadText(report);
  expect(reportBody).toContain("# Import handoff — Migration sample");
  expect(reportBody).toContain("## Source profile");
  expect(reportBody).toContain("## Validation result");
  expect(reportBody).toContain("Original value: \"yes\"");

  const issuesDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export issues CSV" }).click();
  const issues = await issuesDownload;
  expect(issues.suggestedFilename()).toMatch(/\.issues\.csv$/);
  const issuesBody = await downloadText(issues);
  expect(issuesBody).toContain("source_row,source_column,target_field,code,message,original_value");
  expect(issuesBody).toContain("2,Active,active,type,Expected boolean.,yes");
  expect(issuesBody).toContain("4,Active,active,type,Expected boolean.,Y");
});

test("@claim:xlsx-input opens an XLSX worksheet in the demo workspace", async ({ page }) => {
  await page.goto("/demo/");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Replace source" }).click();
  await page.locator("#source-file").setInputFiles({
    name: "customers.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: xlsxFixture
  });
  await expect(page.getByText("customers.xlsx", { exact: true })).toBeVisible();
  await expect(page.locator(".metrics")).toContainText("XLSX");
  await expect(page.locator(".syntax-card")).toContainText("Customers");
  await expect(page.getByRole("heading", { name: "How this file is read" })).toBeFocused();
});

test("@claim:contract-reuse applies an exported contract to a compatible source", async ({ page }) => {
  await page.goto("/demo/");
  await page.getByRole("button", { name: /Continue to map/ }).click();
  const firstTarget = page.locator('[data-index="0"] input[data-field="target"]');
  await firstTarget.fill("migration_customer_code");
  await firstTarget.dispatchEvent("change");
  await page.getByRole("button", { name: /Continue to validate/ }).click();
  await page.getByRole("button", { name: /Review handoff/ }).click();

  const contractDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export contract" }).click();
  const contractBody = await downloadText(await contractDownload);

  await page.getByRole("button", { name: /Source/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Replace source" }).click();
  await page.locator("#source-file").setInputFiles({
    name: "compatible-source.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Customer ID,Email,Join date,Active,Balance\nC-100,second@example.com,01/03/2025,yes,25")
  });
  await expect(page.getByText("compatible-source.csv", { exact: true })).toBeVisible();
  await reachHandoff(page);
  await page.locator("#contract-file").setInputFiles({
    name: "migration.import-contract.json",
    mimeType: "application/json",
    buffer: Buffer.from(contractBody)
  });
  await expect(page.locator("#announcer")).toHaveText("Contract imported and matched to the current source.");
  await expect(page.getByRole("heading", { name: "Export handoff files" })).toBeFocused();
  await page.getByRole("button", { name: /Map/ }).click();
  await expect(page.locator('[data-index="0"] input[data-field="target"]')).toHaveValue("migration_customer_code");
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

test("keeps keyboard focus and announces a workflow step or demo reset", async ({ page }) => {
  await page.goto("/demo/");

  await page.getByRole("button", { name: /Continue to map/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Set the output fields" })).toBeFocused();
  await expect(page.locator("#announcer")).toHaveText("Map step loaded.");

  await page.getByRole("button", { name: /Continue to validate/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Set pass / fail rules" })).toBeFocused();
  await expect(page.locator("#announcer")).toHaveText("Validate step loaded.");

  await page.getByRole("button", { name: "Reset demo" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeFocused();
  await expect(page.locator("#announcer")).toHaveText("Demo reset. Sample data restored.");
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
});

test("provides 44 pixel touch targets for demo, home, footer, and legal links", async ({ page }) => {
  await page.goto("/demo/");
  await expectTouchTarget(page.getByRole("button", { name: "Reset demo" }));
  await expectTouchTarget(page.getByRole("link", { name: "Start for real" }));
  await expectTouchTarget(page.getByRole("link", { name: "CSV Import Contract home" }));

  await page.goto("/");
  await expectTouchTarget(page.locator("footer").getByRole("link", { name: "Privacy" }));
  await expectTouchTarget(page.locator("footer").getByRole("link", { name: "Terms" }));

  await page.goto("/privacy/");
  await expectTouchTarget(page.locator("header > a"));
  await expectTouchTarget(page.locator("footer").getByRole("link", { name: "Privacy" }));
  await expectTouchTarget(page.locator("footer").getByRole("link", { name: "Terms" }));
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
