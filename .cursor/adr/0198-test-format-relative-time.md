# ADR 0198: Unit tests for format-relative-time

## Status

Accepted.

## Context

The module `src/lib/format-relative-time.ts` exposes `formatRelativeTime(ts: number)` for human-readable relative time ("just now", "X min ago", "X h ago", "1 day ago", "X days ago"), used in "Last refreshed" and similar UI. The behaviour depends on `Date.now()` and fixed time boundaries (60s, 1h, 1 day). The module had no unit tests, so boundary and wording regressions were not caught by the test suite.

## Decision

- Add a dedicated Vitest test file: **`src/lib/__tests__/format-relative-time.test.ts`**.
- Use **`vi.useFakeTimers({ now: <fixed ms> })`** so "now" is deterministic and all relative-time buckets are testable.
- Cover:
  - **"just now"**: when diff is zero or under 1 minute; and when timestamp is in the future (diff clamped to 0).
  - **"X min ago"**: when diff is in [1 min, 1 h), including boundary at 60s and 59 min.
  - **"X h ago"**: when diff is in [1 h, 1 day), including boundary at 60 min and 23 h.
  - **"1 day ago"** and **"X days ago"**: when diff is 1 day vs more than 1 day; boundary at 24 h.
- Follow existing project patterns: `describe`/`it`, `beforeEach`/`afterEach` for fake timers, clear assertions on the returned string; no testing of implementation details beyond the public contract.

## Consequences

- Relative time formatting behaviour is documented by tests and protected against regressions.
- Boundary conditions (e.g. 59s vs 60s, 59 min vs 1 h) are explicitly covered; future changes can be validated with `npm run test`.
- Aligns with the project's test-phase focus and the convention of colocating lib tests in `src/lib/__tests__/`.
