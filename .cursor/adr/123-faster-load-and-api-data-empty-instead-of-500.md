# ADR 123: Faster initial load and API data empty instead of 500

## Status

Accepted.

## Context

The app was reported to take too long to load pages and not load any data.

- **Slow load**: In browser, run store hydration waited 2 seconds before treating the environment as non-Tauri, so `refreshData()` (which loads projects/prompts) did not run until 2s had passed. The UI therefore appeared to load slowly with no data.
- **No data**: When the `data` directory was missing (e.g. fresh clone or dev without seed data), `/api/data` returned 500. The frontend then showed an error and empty lists, making it seem like "no data" and a broken app.

## Decision

1. **Shorter Tauri detection cutoff (RunStoreHydration)**  
   Reduce the delay after which we set `isTauriEnv` to `false` (when still `null`) from 2000ms to 400ms. We already check at 0ms and 150ms; 400ms is enough for Tauri’s `__TAURI__` to be present if we’re in the Tauri webview. In browser, `refreshData()` now runs after ~400ms instead of 2s, so the app loads data much sooner.

2. **API data: 200 with empty payload when data dir missing**  
   When the data directory does not exist or is not a directory, `/api/data` returns **200** with empty arrays (`allProjects`, `activeProjects`, `prompts`, `tickets`, `features`, `kvEntries`) and an optional `_warning` string. This allows the app to load and show empty states instead of a 500 and a generic error. Callers can ignore `_warning` or use it for a non-blocking hint (e.g. “No data folder found”).

## Consequences

- First load in browser is noticeably faster; data fetch starts after ~400ms instead of 2s.
- When the data directory is missing, the app still loads and shows empty lists instead of failing with 500.
- Tauri detection remains safe: we only assume “browser” after 400ms if `isTauri()` is still false.
