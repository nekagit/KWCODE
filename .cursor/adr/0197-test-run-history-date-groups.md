# ADR 0197: Unit tests for run-history-date-groups

## Status

Accepted.

## Context

The run history date grouping module (`src/lib/run-history-date-groups.ts`) provides `getRunHistoryDateGroupKey`, `groupRunHistoryByDate`, `getRunHistoryDateGroupOrder`, and `getRunHistoryDateGroupTitle` for the Run tab History table (Today, Yesterday, Last 7 days, Older). The module had no unit tests, so regressions in date boundaries or grouping behaviour were not caught by the test suite.

## Decision

- Add a dedicated Vitest test file: **`src/lib/__tests__/run-history-date-groups.test.ts`**.
- Use **`vi.useFakeTimers({ now: <fixed date> })`** so that "today", "yesterday", and "last 7 days" boundaries are deterministic (e.g. fix "now" to noon on 2026-02-18).
- Cover:
  - **getRunHistoryDateGroupKey**: "today", "yesterday", "last7", "older" for timestamps in each range; non-finite timestamps map to "older".
  - **groupRunHistoryByDate**: entries are bucketed correctly, order within each group is preserved, invalid timestamps fall into "older".
  - **getRunHistoryDateGroupOrder**: returns the expected ordered list of keys.
  - **getRunHistoryDateGroupTitle**: returns a string containing the group label and date information for each key.
- Follow existing project patterns: `describe`/`it`, clear assertions, no testing of implementation details beyond the public contract.

## Consequences

- Run history date grouping behaviour is documented by tests and protected against regressions.
- Date-boundary and grouping logic can be validated with `npm run test`; fake timers keep tests deterministic across runs and timezones.
- Aligns with the project's test-phase focus and the convention of colocating lib tests in `src/lib/__tests__/`.
