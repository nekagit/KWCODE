# ADR 0120 — Ideas page: persist sort and filter preference

## Status

Accepted.

## Context

The Ideas page ("My ideas" tab) lets users sort (newest, oldest, title A–Z, title Z–A) and filter by title. Previously, these choices were lost on navigation or refresh. Run history already persists its sort and filter preferences via `run-history-preferences.ts` and localStorage. Users benefit from the same behaviour on the Ideas page: returning to the page restores their last sort and filter.

## Decision

- Add **`src/lib/ideas-view-preference.ts`** that:
  - Uses localStorage key `kwcode-ideas-view-preference`.
  - Exports `IdeasViewSort` (`"newest" | "oldest" | "title-asc" | "title-desc"`) and `IdeasViewPreference` (`{ sort, filterQuery }`).
  - Exports `getIdeasViewPreference()` — reads and validates stored values; SSR-safe (returns defaults when `window` is undefined).
  - Exports `setIdeasViewPreference(partial)` — writes only provided fields; filter query capped at 500 characters.
- In **IdeasPageContent**:
  - Initialize `ideaSort` and `filterQuery` state from `getIdeasViewPreference()` (lazy initial state, with SSR guard).
  - When the user changes sort: update state and call `setIdeasViewPreference({ sort })`.
  - When the user types in the filter: debounce 300 ms and call `setIdeasViewPreference({ filterQuery })`.
  - When the user clicks "Reset filters": set state to defaults and call `setIdeasViewPreference({ filterQuery: "", sort: "newest" })`.

## Consequences

- Returning to the Ideas page restores the last sort order and filter query.
- Aligns Ideas page with the Run history preference pattern.
- No backend or API changes; client-only localStorage.
