# ADR 060: Remove delete confirmation dialogs

## Status

Accepted.

## Context

Delete actions (features, tickets, projects, prompts, designs, ideas, architectures) used a native `confirm()` dialog before performing the delete. In practice the confirmation appeared after or out of sync with the delete, so the dialog was misleading. Users requested removal of the confirmation screen so that delete is a single, immediate action.

## Decision

- Remove all `confirm(...)` calls before delete operations across the app.
- Delete actions execute immediately when the user clicks delete (or "Delete all").
- Existing toasts and error handling for success/failure remain unchanged.

**Files updated:**

- `src/app/page.tsx` – delete all features (no confirm)
- `src/app/projects/page.tsx` – delete project (no confirm)
- `src/app/prompts/page.tsx` – delete prompt (no confirm)
- `src/app/design/page.tsx` – delete design (no confirm)
- `src/app/ideas/page.tsx` – delete idea (no confirm)
- `src/app/architecture/page.tsx` – delete architecture (no confirm)

Feature and ticket delete on the main page had no confirmation; only "Delete all" features did.

## Consequences

- No confirmation dialog on any delete; one click performs the delete.
- Risk of accidental deletion is accepted; users can rely on toasts and UI feedback.
- Simpler, consistent behavior across all delete actions.
