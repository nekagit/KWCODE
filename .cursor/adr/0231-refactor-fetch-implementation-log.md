# ADR 0231: Refactor — extract implementation log fetch to lib

## Status

Accepted.

## Context

ProjectControlTab contained inline dual-mode fetch for implementation log entries: Tauri uses `get_implementation_log_entries` via invoke; browser uses GET `/api/data/projects/:id/implementation-log`. Raw rows were mapped to a LogEntry shape (including parsing `files_changed` JSON). This duplicated the fetch contract and made the component heavier. Extracting the fetch into a lib gives one place for the contract, keeps the component focused on UI, and allows reuse.

## Decision

- Introduce **`src/lib/fetch-implementation-log.ts`** exporting:
  - **`ImplementationLogEntry`** — type for one log entry (id, project_id, run_id, ticket_number, ticket_title, milestone_id, idea_id, completed_at, files_changed, summary, created_at, status).
  - **`fetchImplementationLogEntries(projectId: string)`** — returns `Promise<ImplementationLogEntry[]>`.
- The module performs dual-mode fetch: Tauri invoke with `projectIdArgPayload(projectId)`, map raw rows (parse `files_changed` string to array); browser fetch implementation-log route, use response as-is (API already returns parsed entries). Throws on error so the caller keeps existing try/catch/finally and debug/ingest logging.
- **ProjectControlTab** calls `fetchImplementationLogEntries(projectId)` in `load`, then `setEntries(result)`. Milestones and ideas fetch remain in the component. `setEntryStatus` and all UI unchanged.

## Consequences

- Single place for the implementation log fetch contract; future API or mapping changes are done once.
- Behaviour unchanged; existing error handling, loading state, and agent logging preserved.
- ProjectControlTab remains responsible for loading/error state and milestones/ideas; only the log fetch and row mapping are shared.
