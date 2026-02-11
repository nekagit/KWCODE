/**
 * E2E: Kanban load/sync — project detail Todo tab loads Kanban (columns or empty state).
 */
import { test, expect } from "@playwright/test";

test.describe("Kanban load and display", () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/data/projects", {
      data: {
        name: "E2E Kanban Project",
        description: "For Kanban E2E",
      },
    });
    expect(res.ok()).toBeTruthy();
    const project = await res.json();
    projectId = project.id;
  });

  test("project detail Todo tab shows Kanban board area", async ({ page }) => {
    await page.goto(`/projects/${projectId}`);

    await expect(page.getByTestId("project-detail-page")).toBeVisible();
    await page.getByRole("tab", { name: /todo/i }).click();

    const kanbanGrid = page.getByTestId("kanban-columns-grid");
    await expect(kanbanGrid).toBeVisible({ timeout: 10000 });
  });

  test("Kanban columns or empty state is present", async ({ page }) => {
    await page.goto(`/projects/${projectId}`);

    await page.getByRole("tab", { name: /todo/i }).click();

    const board = page.getByTestId("kanban-board");
    const grid = page.getByTestId("kanban-columns-grid");
    await expect(board.or(grid)).toBeVisible({ timeout: 10000 });
  });
});
