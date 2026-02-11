# E2E tests for critical flows (Ticket #2)

## Status
Accepted (2026-02-11)

## Context
Ticket #2 required adding E2E tests for critical flows: project detail, run script UI, and Kanban load/sync. The project already had Playwright as a dev dependency and a `playwright.config.ts` pointing at `./e2e` with baseURL and webServer; the `e2e/` directory did not exist yet.

## Decision
1. **Create `e2e/` with three spec files** (aligned with .cursor/test-best-practices.md):
   - **home-navigation.spec.ts**: Home page loads (home-page-tabs), navigation to Run and Projects via sidebar.
   - **run-page.spec.ts**: Run page loads (run-page, run-page-controls), Start/Stop buttons visible, Start disabled when no prompt/project selected.
   - **project-detail.spec.ts**: Projects list loads; open first project; project detail page and tabs (Git, Todo, Setup); Todo tab shows Kanban area (kanban-board or kanban-columns-grid).
2. **Browser-mode only**: Tests use the Next.js dev server and `/api/data/projects`; no Tauri. Project detail tests ensure at least one project via `beforeEach` (POST /api/data/projects when list is empty).
3. **Stable selectors**: Prefer `data-testid` and `getByRole`; use `locator('a[href^="/projects/"]').first()` for “first project link” to avoid depending on project name.
4. **Minimal new data-testids**: Added `data-testid="projects-list"` on the projects list section in `ProjectsListPageContent` for reliable waiting. Existing testids (project-detail-page, project-detail-tabs, tab-*, run-page, run-page-controls, kanban-board, kanban-columns-grid, home-page-tabs) are used as-is.

## Consequences
- Critical user journeys (home, run page, project detail, Kanban) are covered by E2E; regressions can be caught by `npm run test:e2e`.
- Tests are independent and can run in any order; project-detail specs create fixture data via API when needed.
- Run flow does not actually start a run (no Tauri, no real script); it only asserts the Run UI and disabled Start state.
