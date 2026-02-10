# ADR 128: Data not loaded – surface errors and data warning

## Status

Accepted.

## Context

Users reported "the data is not loaded in the app". Data can fail to load in two ways:

1. **Tauri**: Backend commands (`get_all_projects`, `get_active_projects`, `get_prompts`) can fail (e.g. project root not found, DB error). The store was using `.catch(() => [])` on each invoke, so failures resulted in empty arrays and no error message.
2. **Browser**: The `/api/data` route returns 200 with empty arrays and a `_warning` when the data directory is missing. The frontend stored the empty arrays but did not show the warning, so users saw empty lists with no explanation.

## Decision

- **Tauri**: Remove per-invoke `.catch(() => [])` in `refreshData`. Let the outer try/catch handle failures so the store sets `error` and the UI shows the backend message (e.g. "Project root not found. Run the app from the repo root...").
- **Browser**: Add a `dataWarning` field to the run store. When the API returns 200 with `_warning`, set `dataWarning` so the Run page (and any consumer) can show a non-destructive alert explaining why data is empty.
- **Run page**: Show `dataWarning` in an amber-tinted alert when present and there is no fatal `error`.

## Consequences

- Tauri users see a clear error when the backend cannot find project root or DB, instead of empty lists.
- Browser users see why data is empty when the data directory is missing.
- Run store gains `dataWarning: string | null`; `useRunState()` exposes it for UI use.
