# ADR 102: Project details – inline edit title/path, remove Edit / Analysis / Export buttons

## Context

The project details page header showed the project name, an Edit link (to `/projects/:id/edit`), an Analysis button, and an Export as JSON button. Users wanted a simpler header: edit the project name and repo path directly on the page by clicking them, and remove the Edit, Analysis, and Export actions from the header.

## Decision

- **Remove** from the project details header:
  - The Edit button (link to project edit page).
  - The Analysis button (full analysis dialog trigger).
  - The Export as JSON button.
- **Inline editing** for project name and repo path:
  - Clicking the **title** (project name) switches to an input; on blur or Enter the value is saved via `updateProject` and the header shows the name again (with optional loading state).
  - Clicking the **path** (repo path, or “Click to set repo path” when empty) switches to an input; on blur or Enter the value is saved. Escape cancels without saving.
  - Both use existing `updateProject(id, { name })` and `updateProject(id, { repoPath })`; no new API.
- Analysis and Export are still available elsewhere (e.g. Analysis in Todos/Design/Architecture cards; export logic remains in code but is not exposed in the header).

## Consequences

- Fewer header actions; name and path are editable in place without leaving the details page.
- Keyboard support: Enter to save, Escape to cancel when editing; title/path are focusable and activatable with Enter/Space for accessibility.
- Edit page and Analysis/Export flows are unchanged for other entry points.
