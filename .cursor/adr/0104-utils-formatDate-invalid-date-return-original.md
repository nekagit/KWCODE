# ADR 0104: utils formatDate — return original string for Invalid Date

## Status

Accepted.

## Context

- `src/lib/utils.ts` `formatDate(iso: string)` uses `new Date(iso)` then `toLocaleDateString`/`toLocaleTimeString`. For unparseable or invalid calendar input (e.g. `"not-a-date"`, `"2025-02-30"`), `new Date(iso)` does not throw but yields an Invalid Date (`getTime()` is NaN). The function was returning the locale "Invalid Date" string instead of the original.
- Unit test in `src/lib/__tests__/utils.test.ts` already expected `formatDate("not-a-date")` to return `"not-a-date"`; that failed with the previous implementation.

## Decision

- In `formatDate`, after `const d = new Date(iso)`, add a guard: if `Number.isNaN(d.getTime())` then return `iso`. This makes invalid/unparseable input pass through unchanged and satisfies the existing test.

## Consequences

- `formatDate("not-a-date")` and `formatDate("2025-02-30")` now return the original string instead of a locale "Invalid Date" string.
- Existing test "returns original string for invalid date" passes; "formats invalid calendar date (e.g. Feb 30)..." still passes (asserts non-empty string).
- Callers (e.g. tickets table) see the raw value when date is invalid instead of "Invalid Date", which is more predictable and debuggable.

## References

- ADR 0100 — test for invalid calendar date (behavior now updated by this guard)
- `src/lib/utils.ts` — `formatDate`
- `src/lib/__tests__/utils.test.ts` — formatDate describe block
