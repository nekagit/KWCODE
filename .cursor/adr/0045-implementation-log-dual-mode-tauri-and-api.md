# ADR 0045: Implementation log dual-mode (Tauri commands + API fallback)

## Status

Accepted.

## Context

The implementation log (completed ticket runs, accept/decline) was only consumed via Next.js API routes (`GET/POST/PATCH`). In Tauri desktop mode, the app uses the same SQLite database as the API when running in dev; for consistency and to support desktop usage without depending on the Next server for this data path, we want the implementation log to be readable and writable via Tauri commands when in Tauri, and to keep the API as the fallback for browser mode.

## Decision

1. **Tauri commands**
   - `get_implementation_log_entries(project_id)` — list entries for a project (newest first).
   - `update_implementation_log_entry_status(project_id, entry_id, status)` — set status to `accepted` or `declined`.
   - `append_implementation_log_entry(...)` — already existed; used when a run exits in Tauri mode to append an entry.

2. **Frontend dual-mode**
   - **ProjectControlTab:** When `isTauri`, load entries via `invoke("get_implementation_log_entries", { project_id })` and update status via `invoke("update_implementation_log_entry_status", { project_id, entry_id, status })`. Otherwise use existing `fetch` to `/api/data/projects/[id]/implementation-log` and `.../implementation-log/[entryId]` PATCH.
   - **run-store-hydration (script-exited):** When `isTauri`, append via `invoke("append_implementation_log_entry", { ... })` with `files_changed` as JSON string; otherwise `POST` to the implementation-log API.

3. **API routes unchanged**
   - Next.js routes remain the single source for browser mode and for any server-side or external callers.

## Implementation

- **src-tauri/src/lib.rs:** Added `ImplementationLogEntry` struct; `get_implementation_log_entries`, `update_implementation_log_entry_status`; both registered in `invoke_handler`.
- **src/components/molecules/TabAndContentSections/ProjectControlTab.tsx:** `load()` uses invoke when `isTauri` and maps Rust response (including parsing `files_changed` JSON); `setEntryStatus()` uses invoke when `isTauri`.
- **src/store/run-store-hydration.tsx:** On script-exited with ticket meta, if `isTauri` call `append_implementation_log_entry` with snake_case args and `files_changed: JSON.stringify(filesChanged)`; else keep existing fetch POST.

## Consequences

- Desktop app can read/write implementation log via Tauri and the same SQLite DB without going through Next.js.
- Browser mode continues to use API routes only.
- Single source of truth remains SQLite (`implementation_log` table); Tauri and Next.js both use the same DB file when running from the repo.
