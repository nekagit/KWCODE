# ADR 0039: Prompts page — .cursor prompts tab (sync with repo)

## Status

Accepted.

## Context

The app has many `.prompt.md` files under `.cursor` and `.cursor_template` (e.g. `1. project/prompts/design.prompt.md`, `8. worker/refactoring.prompt.md`). Users wanted:

- All these prompt files to be visible on the **Prompts page** (already in the navigation sidebar at `/prompts`).
- A dedicated tab that lists them in a **table** and stays **in sync** with the actual `.cursor` files (no separate copy: the table is populated by scanning the repo).

## Decision

- Add a new tab **".cursor prompts"** on the Prompts page (`/prompts`), as the first tab.
- The tab shows a **table** of all `*.prompt.md` files found under:
  - `.cursor` (app/repo root)
  - `.cursor_template`
- Table columns: **Path**, **Name**, **Source** (.cursor vs template), **Size**, **Updated**, **Actions** (View for `.cursor` files; template files are read-only from this UI).
- **Sync:** The list is loaded from the server on page load and when the user clicks **Refresh**; no separate stored list. The server scans the filesystem each time.
- **View:** For files under `.cursor`, "View" fetches content via existing `/api/data/cursor-doc?path=...` and opens the same prompt content dialog used for General/project prompts.
- New API: `GET /api/data/cursor-prompt-files` returns `{ files: CursorPromptFileEntry[] }` with `relativePath`, `path`, `name`, `size`, `updatedAt`, `source` (".cursor" | ".cursor_template"). Implemented by recursively walking the two directories for `*.prompt.md`.
- New component: `CursorPromptFilesTable` (path, loading, onRefresh, onView). Used only in the new tab.

## Consequences

- Users see all `.prompt.md` files in one place on the Prompts page and can open content for `.cursor` files.
- The table always reflects the current repo contents after refresh; no drift from added/removed files.
- `.cursor_template` files are listed for reference but not viewable from this UI (cursor-doc only serves `.cursor`); they can be viewed by opening the repo in an editor.
- Prompts page remains in the sidebar under Work (unchanged); no new sidebar item.

## References

- `src/app/api/data/cursor-prompt-files/route.ts` — API that lists `*.prompt.md` under .cursor and .cursor_template
- `src/components/molecules/ListsAndTables/CursorPromptFilesTable.tsx` — table component
- `src/components/organisms/PromptRecordsPageContent.tsx` — new tab ".cursor prompts", fetch and View handler
- `src/app/api/data/cursor-doc/route.ts` — existing read for .cursor file content (used for View)
