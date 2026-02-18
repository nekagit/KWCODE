# ADR 0199: Unit tests for run-history-preferences

## Status

Accepted.

## Context

The module `src/lib/run-history-preferences.ts` persists run history sort and filter preferences in localStorage (sort order, exit status, date range, slot, filter query) and exposes `getRunHistoryPreferences()` and `setRunHistoryPreferences()`. It validates stored values and falls back to defaults for invalid or missing data. The module had no unit tests, so validation and merge behaviour were not covered by the test suite.

## Decision

- Add a dedicated Vitest test file: **`src/lib/__tests__/run-history-preferences.test.ts`**.
- Use a **mock `localStorage`** (in-memory object with getItem/setItem/clear) and attach it to **`globalThis.window`** in `beforeEach` so the module’s browser path is exercised; restore `window` in `afterEach`.
- Cover:
  - **Defaults**: `DEFAULT_RUN_HISTORY_PREFERENCES` and `RUN_HISTORY_FILTER_QUERY_MAX_LEN` shape/values.
  - **getRunHistoryPreferences**: returns defaults when storage is empty or key missing; returns validated preferences when storage has valid JSON; invalid or unknown values for sortOrder, exitStatusFilter, dateRangeFilter, slotFilter fall back to defaults; filterQuery is trimmed and capped at max length; invalid JSON or parse-to-null returns defaults.
  - **setRunHistoryPreferences**: writes full defaults when given default shape; merges partial update onto current; ignores invalid partial enum values and keeps current; normalizes and caps filterQuery on set.
  - **SSR guard**: when `window` is undefined, get returns defaults and set does not throw.
- Follow existing project patterns: `describe`/`it`, `beforeEach`/`afterEach`, clear assertions; no testing of implementation details beyond the public API.

## Consequences

- Run history preferences behaviour is documented by tests and protected against regressions.
- Validation and localStorage merge logic can be changed with confidence; run `npm run test` or `npx vitest run src/lib/__tests__/run-history-preferences.test.ts` to validate.
- Aligns with the project’s test-phase focus and the convention of colocating lib tests in `src/lib/__tests__/`.
