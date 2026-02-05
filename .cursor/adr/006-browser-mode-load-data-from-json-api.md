# ADR 006: Browser mode – load data from JSON via API

## Status

Accepted.

## Context

The app only loaded data when running inside Tauri (`isTauri()`). In the browser (e.g. `npm run dev`), the UI showed "Run in Tauri" and did not display projects, tickets, features, or prompts. Users expect to see existing data from `data/*.json` when opening the app in the browser.

## Decision

- **API route**: Add `GET /api/data` that reads from the project `data/` directory and returns `allProjects`, `activeProjects`, `prompts`, `tickets`, `features` with the same shape the frontend expects. Uses Node `fs` and `path` with `process.cwd()` so the route works in dev and build.
- **Frontend**: When not in Tauri, `loadData()` fetches `/api/data` and populates state instead of returning early. Data loading runs for both Tauri and non-Tauri; only the source differs (Tauri commands vs fetch).
- **UI**: Remove the "Run in Tauri" full-screen block. The main app (dashboard, prompts, projects, tickets, features) is shown in both environments. Actions that require the desktop app (e.g. run script, save to disk) remain gated by `isTauriEnv` and will show errors if used in the browser.

## Consequences

- JSON data is visible when running in the browser; no need to open the Tauri app just to view data.
- Single code path for rendering; browser is read-only for data sourced from JSON (saves still go through Tauri when in desktop).
- Aligns with best practice: support both desktop and web with a clear fallback for data loading.
