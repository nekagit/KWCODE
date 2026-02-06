# ADR 014: Browser – actually load data from /api/data

## Status

Accepted.

## Context

ADR 006 specified that in browser mode the frontend should fetch `GET /api/data` and populate state so that projects, tickets, features, and prompts are visible. The API route was implemented and reads from `data/*.json`, but the frontend never called it when not in Tauri: `loadData()` in run-state returned early when `!isTauri()`, and tickets/features in the page were only loaded via Tauri commands. As a result, JSON data did not appear in the app when running in the browser.

## Decision

- **Run state (projects, prompts):** In `run-state.tsx`, `loadData()` now supports both environments: when `isTauri()` it uses Tauri `invoke` (SQLite-backed); when not in Tauri it fetches `GET /api/data` and sets `allProjects`, `activeProjects`, `prompts`. The effect that triggers load runs when `isTauriEnv !== null` (i.e. after env is known), so both Tauri and browser load data.
- **Tickets and features:** In `page.tsx`, a new effect runs when `isTauriEnv === false` and `!ticketsLoaded`: it fetches `GET /api/data` and sets `tickets`, `features`, and `dataKvEntries` (for the Data tab). Tauri path unchanged (existing `loadTicketsAndFeatures()`).
- **Data tab in browser:** KV store entries in the Data tab are now populated from the same `/api/data` response (`kvEntries`) when in browser, so the tab shows the same logical data as in Tauri (sourced from JSON instead of SQLite).

## Consequences

- Browser mode now shows projects, prompts, tickets, and features from `data/*.json` via the existing API. No new API routes.
- SQLite remains Tauri-only at `data/app.db` (created on first Tauri run; see ADR 005, 008). Browser continues to be read-only for persistence; saves require the Tauri app.
- Aligns implementation with ADR 006 and documents the fix for future reference.

## References

- ADR 006 (Browser mode – load data from JSON via API)
- ADR 005 (SQLite database for data)
- ADR 008 (SQLite location and browser Data tab)
