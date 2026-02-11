/**
 * E2E: Home and navigation — critical flow for app shell and dashboard.
 * Ticket #2 — home page loads, navigation to Run and Projects works.
 */
import { test, expect } from "@playwright/test";

test.describe("Home and navigation", () => {
  test("home page loads with dashboard tabs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-page-tabs")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to Run from sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /run/i }).click();
    await expect(page).toHaveURL(/\/run/);
    await expect(page.getByTestId("run-page")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to Projects from sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /projects/i }).click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByRole("heading", { name: /projects|your projects/i })).toBeVisible({ timeout: 10000 });
  });
});
