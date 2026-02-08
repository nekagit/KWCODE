# ADR 092: todos-kanban.json on Sync; Archive to .cursor/legacy

## Status

Accepted.

## Context

The user wanted: (1) JSON files for feature and ticket data so they can see/use the data on disk; (2) when pressing Sync, ensure everything is there and if something is missing they can click Analysis; (3) a `.cursor/legacy` folder where old `tickets.md` and `features.md` are stored when archiving; (4) a new **Archive** button on the Tickets and Features cards that moves the current file to legacy with a timestamp (e.g. `tickets-2026-02-08.md`) and creates a new file in `.cursor` root.

## Decision

1. **Write `.cursor/todos-kanban.json` on Sync (Tauri)**
   - When the user clicks **Sync** in the Kanban section, after fetching and parsing `.cursor/features.md` and `.cursor/tickets.md`, the app (when running in Tauri with a project repo path) also writes the parsed JSON to `.cursor/todos-kanban.json` in the project repo via `write_spec_file`. The file contains `{ features, tickets, parsedAt }` (same shape as the in-memory Kanban data). This gives a persistent JSON file for features and tickets that the user can open or use elsewhere.

2. **`.cursor/legacy/` and Archive**
   - Add a Tauri command `archive_cursor_file(project_path, file_kind)` where `file_kind` is `"tickets"` or `"features"`.
   - The command: (a) reads the current `.cursor/tickets.md` or `.cursor/features.md`; (b) creates `.cursor/legacy` if it does not exist; (c) writes the current content to `.cursor/legacy/tickets-YYYY-MM-DD.md` or `.cursor/legacy/features-YYYY-MM-DD.md` (date from `chrono::Utc::now().format("%Y-%m-%d")`); (d) writes a new minimal `.cursor/tickets.md` or `.cursor/features.md` (template with required sections / placeholder text).
   - Filename format: `tickets-2026-02-08.md` and `features-2026-02-08.md` (user requested “ticket-2026-02-05.md” style; we use `tickets-` / `features-` for consistency with the file type).

3. **Archive button on the cards**
   - On the **Features** card (Todos tab): add an **Archive** button (Tauri only, when project has repo path). On click: call `archive_cursor_file(projectPath, "features")`, then refetch features and tickets markdown so the Kanban and cards refresh; show a success toast.
   - On the **Tickets** card: same with **Archive** and `archive_cursor_file(projectPath, "tickets")`.
   - Buttons show a loading state while the archive runs and are disabled when any archive is in progress.

4. **Documentation**
   - `.cursor/sync.md`: Extend item 3 (Kanban/JSON) to state that Sync writes `.cursor/todos-kanban.json` (Tauri). Add item 4 describing Archive and `.cursor/legacy/` (location, how to use the button, what happens after archiving).

## Consequences

- Users get a concrete JSON file (`.cursor/todos-kanban.json`) after Sync in Tauri, so feature and ticket data is visible and usable on disk.
- Old tickets/features can be kept in `.cursor/legacy/` with a clear timestamp; a new file is created so the user can run Analysis again or start fresh.
- Archive is Tauri-only because it writes into the project repo; browser mode has no Archive button.
