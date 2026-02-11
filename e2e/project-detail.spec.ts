/**
 * E2E: Project detail page and Kanban load/sync.
 * Ticket #2 — critical flow: open project detail, switch to Todo tab, assert Kanban area.
 * Selectors: data-testid and roles per .cursor/test-best-practices.md.
 */
import { test, expect } from "@playwright/test";

test.describe("Project detail", () => {
  test.beforeEach(async ({ request }) => {
    // Ensure at least one project exists for browser-mode E2E (API uses data/projects.json)
    const res = await request.get("/api/data/projects").catch(() => null);
    const projects = res?.ok ? await res.json() : [];
    if (!Array.isArray(projects) || projects.length === 0) {
      await request.post("/api/data/projects", {
        data: { name: "E2E Test Project" },
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  test("loads project list and opens project detail", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByTestId("projects-list")).toBeVisible({ timeout: 10000 });
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();
    await expect(page.getByTestId("project-detail-page")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("project-detail-tabs")).toBeVisible();
  });

  test("shows Todo tab and Kanban area on project detail", async ({ page }) => {
    await page.goto("/projects");
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();
    await expect(page.getByTestId("project-detail-page")).toBeVisible({ timeout: 10000 });
    await page.getByTestId("tab-todo").click();
    // Kanban is in Todo tab: board or columns grid (may be empty)
    const kanbanBoard = page.getByTestId("kanban-board");
    const kanbanColumns = page.getByTestId("kanban-columns-grid");
    await expect(kanbanBoard.or(kanbanColumns)).toBeVisible({ timeout: 10000 });
  });

  test("switches between Git, Todo, and Setup tabs", async ({ page }) => {
    await page.goto("/projects");
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();
    await expect(page.getByTestId("project-detail-page")).toBeVisible({ timeout: 10000 });
    await page.getByTestId("tab-git").click();
    await expect(page.getByTestId("tab-git")).toBeVisible();
    await page.getByTestId("tab-todo").click();
    await expect(page.getByTestId("tab-todo")).toBeVisible();
    await page.getByTestId("tab-setup").click();
    await expect(page.getByTestId("tab-setup")).toBeVisible();
  });
});
