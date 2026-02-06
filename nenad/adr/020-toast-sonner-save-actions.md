# ADR 020: Toast (Sonner) for save actions

## Status
Accepted

## Context
Users had no immediate feedback when clicking save buttons (e.g. "Save active to cursor_projects.json", saving tickets, saving features). Success or failure was only visible via error state or by re-checking data.

## Decision
- Add **sonner** for toast notifications.
- Render a single `<Toaster />` in the root layout (inside `RunStateProvider`) with `richColors` and `position="top-center"`.
- Show a **success** toast on successful save and an **error** toast (with description) on failure for:
  - **Save active projects** (`saveActiveProjects` in run-state) → "Saved active projects to cursor_projects.json" / "Failed to save projects"
  - **Save tickets** (`saveTickets` in page) → "Tickets saved" / "Failed to save tickets"
  - **Save features** (`saveFeatures` in page) → "Features saved" / "Failed to save features"

## Consequences
- Users get immediate, non-blocking feedback on save actions without scanning the UI for error text.
- One dependency added: `sonner`.
- Toasts are consistent across dashboard, run page, and any future save actions that use the same handlers.
