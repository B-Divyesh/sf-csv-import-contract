import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("builds a contract end to end and remains usable offline", async ({ page, context }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Make the import.*repeatable/i);
  await page.getByRole("button", { name: "Try a safe sample" }).click();
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Continue to map/ }).click();
  await expect(page.getByRole("heading", { name: "Define the receiving shape" })).toBeVisible();
  await page.getByRole("button", { name: /Continue to validate/ }).click();
  await expect(page.getByRole("heading", { name: "Set pass / fail rules" })).toBeVisible();
  await page.getByRole("button", { name: /Review handoff/ }).click();
  await expect(page.getByRole("button", { name: "Export contract" })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);

  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("migration-sample.csv", { exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("legal pages expose one heading and a main landmark", async ({ page }) => {
  for (const path of ["/privacy/", "/terms/"]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});
