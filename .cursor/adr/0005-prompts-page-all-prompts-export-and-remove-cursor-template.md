# ADR 0005: Prompts page – cover all prompts, export options, remove cursor_template mentions

## Status

Accepted. Implemented 2025-02-18.

## Context

- The prompts page did not show all existing prompts: general prompts were read only from `data/prompts-export.json`, while `.cursor/prompt-records.json` was used elsewhere (e.g. `/api/data`, dashboard metrics), so some prompts were missing from the page.
- There was no way to export all prompts (general or .cursor) in bulk.
- The codebase and UI referred to `.cursor_template` in multiple places; product decision was to remove those mentions and rely on `.cursor` and project_template only where applicable.

## Decision

### 1. Prompts page covers all prompts

- **API GET `/api/data/prompts`**
  - Reads from both `data/prompts-export.json` and `.cursor/prompt-records.json`.
  - Merges by `id`: prompts from `prompts-export.json` take precedence; any prompt in `prompt-records.json` with an id not present in the export is added.
  - Returns the combined, sorted list so the General (and project) tabs show the full set of prompt records.
- **Writes (POST/DELETE)** continue to target only `data/prompts-export.json`; `.cursor/prompt-records.json` is read-only for this UI.

### 2. Export for all prompts

- **General prompts**
  - New libs: `download-all-prompts-json.ts`, `download-all-prompts-csv.ts`, `download-all-prompts-md.ts`.
  - On the Prompts page, General tab: added “Export JSON”, “Export MD”, “Export CSV” that export the current general prompts list (JSON: `{ exportedAt, prompts }`, CSV/MD: same data in table/document form).
- **.cursor prompts (*.prompt.md)**
  - New API: `GET /api/data/cursor-prompt-files/contents` returns all `.cursor` `*.prompt.md` files with content.
  - New libs: `download-all-cursor-prompts-json.ts`, `download-all-cursor-prompts-md.ts`.
  - On the Prompts page, “.cursor prompts” tab: added “Export JSON” and “Export MD” that fetch contents and download as one JSON or one Markdown file.

### 3. Remove cursor_template mentions

- **Cursor prompt files**
  - `GET /api/data/cursor-prompt-files` now lists only `*.prompt.md` under `.cursor` (no longer under `.cursor_template`).
  - `CursorPromptFilesTable` type and UI: removed `source` and any reference to `.cursor_template`; empty state says “No .prompt.md files found in .cursor”.
- **Technologies**
  - Technologies page description and “No tech-stack.json” message no longer mention `.cursor_template/technologies/`.
  - `GET /api/data/technologies` no longer reads from `.cursor_template/technologies`; only `.cursor/technologies` and project_template (folder or zip).
- **Init template (browser)**
  - `api-projects.ts` and `cursor-init-template` route: user-facing error messages and comments no longer mention `.cursor_template` (e.g. “Template folder not found”).
  - `src-tauri/src/lib.rs`: comment and error string no longer mention `.cursor_template`; backend still uses the same template directory path for reading.

## Consequences

- The prompts page shows the full set of prompt records from both data sources; no duplicate ids (export wins on conflict).
- Users can export all general prompts as JSON, CSV, or Markdown, and all .cursor prompts as JSON or Markdown.
- UI and docs no longer reference `.cursor_template`; technologies and cursor prompt listing use only `.cursor` (and project_template where applicable). Template init behavior is unchanged; only naming in user-facing text was removed.
