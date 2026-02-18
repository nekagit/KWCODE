# ADR 0133 — Run history: Persist filter query (search text)

## Status

Accepted.

## Context

The Run tab's History section has a "Filter by label" text input; sort and dropdown filters (status, date range, slot) are already persisted in localStorage via `run-history-preferences`. The search text was not persisted, so returning to the Run tab always showed an empty filter. Users who repeatedly filter by the same label (e.g. ticket number or phase name) had to re-enter the query each time.

## Decision

- **Extend `src/lib/run-history-preferences.ts`**:
  - Add **`filterQuery: string`** to `RunHistoryPreferences` and `DEFAULT_RUN_HISTORY_PREFERENCES` (default `""`).
  - Persist and restore `filterQuery` in `getRunHistoryPreferences()` and `setRunHistoryPreferences()`; normalize with trim and cap at **500 characters** (`RUN_HISTORY_FILTER_QUERY_MAX_LEN`).
  - Add `filterQuery?: string` to `RunHistoryPreferencesPartial`.
- **ProjectRunTab `WorkerHistorySection`**:
  - Initialize **`filterQuery`** state from `getRunHistoryPreferences().filterQuery`.
  - **Debounce** (400 ms) writes: when `filterQuery` changes, call `setRunHistoryPreferences({ filterQuery })` after the delay so every keystroke does not hit localStorage.
  - **Restore defaults**: when the user clicks "Restore defaults", set local `filterQuery` to `DEFAULT_RUN_HISTORY_PREFERENCES.filterQuery` and call `setRunHistoryPreferences(DEFAULT_RUN_HISTORY_PREFERENCES)`.
  - **"Restore defaults" visibility**: include `filterQuery !== DEFAULT_RUN_HISTORY_PREFERENCES.filterQuery` in `isNonDefaultPreferences` so the button appears when only the search text is non-empty.

## Consequences

- Returning to the Run tab restores the last "Filter by label" text, consistent with other run history preferences.
- Stored value is trimmed and length-capped to avoid abuse and keep localStorage small.
- No new lib file; existing run-history-preferences module and UI patterns are reused.
