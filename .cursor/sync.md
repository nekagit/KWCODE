# Sync checklist — what needs to be synced

This document lists everything that should be kept in sync and up to date, following project standards and best practice. Use the **Sync** button on the project details page (Todos tab) to verify these items.

## 1. `.cursor/features.md` and `.cursor/tickets.md` correlation

- **Rule:** Features in `.cursor/features.md` must consist of work items (tickets) from `.cursor/tickets.md`.
- **Checks:**
  - Every feature listed in `features.md` should reference at least one ticket (e.g. `#1`, `#2`) that exists in `tickets.md`.
  - Every ticket number referenced in `features.md` should exist in `tickets.md` (checklist lines like `- [ ] #N` or `- [x] #N`).
  - Feature names used under `#### Feature: <name>` in `tickets.md` should have a corresponding feature line in `features.md` (same names and ticket refs).
- **Standards:** See `.cursor/features-tickets-correlation.md` and `.cursor/tickets-format.md` for format and workflow.
- **When out of sync:** Run **Analysis: Tickets** from the Tickets card to regenerate both files in one run, or update one file and then the other so they stay aligned.

## 2. `.cursor/tickets.md` format and structure

- **Rule:** `tickets.md` must follow the canonical structure so the project details page and AI can parse it correctly.
- **Checks:**
  - Required sections present: Title (H1), Metadata block, Summary (Done vs missing), Prioritized work items with P0–P3 and `#### Feature: <name>`, Next steps.
  - Every ticket is a checklist item under a feature: `- [ ] #N Title — description` or `- [x] #N Title — description`.
- **Standard:** See `.cursor/tickets-format.md`.
- **When out of sync:** Re-run Tickets analysis or edit `tickets.md` to match the required structure; then ensure `features.md` is updated to match (see item 1).

## 3. Kanban / JSON representation

- **Rule:** The project details page (Todos tab → Kanban accordion) parses `.cursor/features.md` and `.cursor/tickets.md` into a single JSON structure for display and export.
- **JSON shape:** `{ features: ParsedFeature[], tickets: ParsedTicket[], parsedAt: string }`. Features have `id`, `title`, `ticketRefs`, `done`. Tickets have `id`, `number`, `title`, `description`, `priority` (P0–P3), `featureName`, `done`.
- **Display:** Features are shown in a Kanban with columns "To do" | "Done". Tickets are shown in a Kanban with columns "P0" | "P1" | "P2" | "P3". Use **Copy JSON** to copy the full structure to the clipboard.
- **JSON file:** When you click **Sync** (Tauri only), the app writes `.cursor/todos-kanban.json` in the project repo with the parsed data so the Kanban data is available as a file.
- **When parsing fails or is empty:** Ensure `features.md` and `tickets.md` follow the formats in items 1 and 2 so the parser (see `src/lib/todos-kanban.ts`) can extract features and tickets correctly.

## 4. Archive and `.cursor/legacy/`

- **Rule:** You can archive the current `.cursor/tickets.md` or `.cursor/features.md` to keep a timestamped copy before starting fresh.
- **Location:** Archived files are stored in `.cursor/legacy/` with names like `tickets-2026-02-08.md` and `features-2026-02-08.md` (date = archive date).
- **How:** On the project details page (Todos tab), use the **Archive** button on the **Tickets** card or the **Features** card (Tauri only, project must have a repo path). That moves the current file to `.cursor/legacy/{file}-YYYY-MM-DD.md` and creates a new minimal `.cursor/tickets.md` or `.cursor/features.md` in the repo root.
- **After archiving:** Run **Analysis** from the same card (or the other) to regenerate content, then **Sync** in the Kanban section to load and validate.

---

*More sync items may be added below (e.g. spec files vs repo, design/architecture exports, etc.).*
