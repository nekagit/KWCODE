# ADR 0121 — Projects list: Persist sort and filter preference

## Status

Accepted.

## Context

The Projects list page has a sort control (A–Z, Z–A, Recent) and a search filter. When the user navigates away and returns, the sort and filter reset to defaults. The Ideas page and Run history already persist their view preferences in localStorage (see `ideas-view-preference.ts` and `run-history-preferences.ts`); the Projects list had no equivalent, so returning users lost their last view.

## Decision

- Add **`src/lib/projects-list-view-preference.ts`** with storage key `kwcode-projects-list-view-preference`. Persist **sort order** (`asc` | `desc` | `recent`) and **filter query** (string, max length 500). Export **`getProjectsListViewPreference()`** and **`setProjectsListViewPreference(partial)`**; validate values and cap filter length. SSR-safe: return defaults when `window` is undefined.
- In **ProjectsListPageContent**, initialize **searchQuery** and **sortOrder** from `getProjectsListViewPreference()` in `useState` initializers. On sort change, call `setProjectsListViewPreference({ sortOrder })`. On search query change, debounce (300 ms) and call `setProjectsListViewPreference({ filterQuery: searchQuery })`.

## Consequences

- Returning to the Projects list restores the user’s last sort and search, improving UX and matching the pattern used on the Ideas page and Run history.
- Preference is stored in localStorage; no backend or API changes.
