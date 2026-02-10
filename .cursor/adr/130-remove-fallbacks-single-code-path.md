# ADR 130: Remove fallbacks – single code path, errors surface

## Status

Accepted.

## Context

The codebase had several fallbacks and timeouts that masked failures and made behavior harder to reason about:

- **Projects (Tauri)**: `listProjects()` used a 4s timeout and then fell back to HTTP `/api/data/projects` on invoke failure, returning empty array on both failure paths.
- **Run store**: `refreshData()` in Tauri used `Promise.race` with an 8s timeout; timeout or backend errors were not clearly distinguishable.
- **Run store hydration**: A 10s “safety” timeout forced `loading` to false even when the data load had not completed.
- **Projects page**: A 6s client-side timeout raced with `listProjects()`, showing a generic “Request timed out” instead of the real error.
- **Root loading overlay**: A 5s fallback and layout script (8s) hid the overlay even when React had not hydrated.
- **API /api/data**: When the data directory was missing, the API returned 200 with empty data and a `_warning` instead of failing, so the app appeared to load with no data.
- **Dashboard / Run**: Tauri invokes for tickets, features, scripts, KV used `.catch(() => [])`, so backend errors showed as empty data instead of an error message.

## Decision

- **Single code path, no fallbacks**:
  - **api-projects**: In Tauri, `listProjects()` uses only `invoke("list_projects")`; no timeout race, no HTTP fallback. Errors propagate.
  - **run-store**: `refreshData()` in Tauri uses `Promise.all([get_all_projects, get_active_projects, get_prompts])` with no timeout; `finally` sets `loading: false`, `catch` sets `error`.
  - **run-store-hydration**: Remove the 10s safety timeout; loading is cleared only when `refreshData()` completes (success or failure).
  - **Projects page**: Call `listProjects()` directly; no client-side timeout or Promise.race; show backend or network error in UI.
  - **Root loading overlay**: Hide only when the overlay’s `useEffect` runs (client mounted). Remove the 5s fallback and the layout 8s script.
  - **API /api/data**: When the data directory is missing or invalid, return **500** with an `error` message instead of 200 with empty data and `_warning`.
  - **Dashboard & Run**: Remove `.catch(() => [])` on Tauri invokes; use try/catch or promise `.catch` and set error state so backend failures show in the UI.

## Consequences

- Failures are visible: users see a clear error instead of empty data or endless loading.
- Behavior is predictable: one path per context (Tauri vs browser), no silent fallbacks.
- Dev experience: ensure `data/` exists and `tauri dev` runs after the dev server is ready (e.g. wait for chunks per ADR 129) so the main path succeeds.
