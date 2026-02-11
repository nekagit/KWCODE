/**
 * E2E: Run page — critical flow for run script UI.
 * Ticket #2 — assert Run page loads and controls are present (Start/Stop, prompt/project selection).
 * Selectors: data-testid and getByRole per .cursor/test-best-practices.md.
 */
import { test, expect } from "@playwright/test";

test.describe("Run page", () => {
  test("loads run page and shows run controls", async ({ page }) => {
    await page.goto("/run");
    await expect(page.getByTestId("run-page")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("run-page-controls")).toBeVisible();
  });

  test("shows Start and Stop buttons", async ({ page }) => {
    await page.goto("/run");
    await expect(page.getByTestId("run-page-controls")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /start/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /stop/i })).toBeVisible();
  });

  test("Start is disabled when no prompt and project selected", async ({ page }) => {
    await page.goto("/run");
    await expect(page.getByTestId("run-page-controls")).toBeVisible({ timeout: 10000 });
    const startBtn = page.getByRole("button", { name: /start/i });
    await expect(startBtn).toBeDisabled();
  });
});
