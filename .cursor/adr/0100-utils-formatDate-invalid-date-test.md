# ADR 0100: utils formatDate — test for invalid calendar date (Invalid Date)

## Status

Accepted.

## Context

- Night shift task: improve tests (see `.cursor/8. worker/night-shift.md`).
- `src/lib/utils.ts` `formatDate(iso: string)` uses `new Date(iso)` and `toLocaleDateString`/`toLocaleTimeString`. For invalid calendar dates (e.g. `"2025-02-30"`), `new Date(iso)` does not throw but yields an Invalid Date; the function then returns the locale’s "Invalid Date" string. Existing tests covered valid ISO, non-parseable string (return original), and empty string; they did not document this Invalid Date path.

## Decision

- Add one unit test in `src/lib/__tests__/utils.test.ts` for `formatDate("2025-02-30")`: assert result is a non-empty string (documenting current behavior: locale Invalid Date string).
- No change to production code in `utils.ts`.

## Consequences

- Coverage for the Invalid Date branch is explicit; future changes (e.g. returning the original string for Invalid Date) will be caught by this test if expectations are updated.
- Aligns with existing utils test style and ADRs (e.g. 0089, 0090).

## References

- `src/lib/utils.ts` — `formatDate`
- `src/lib/__tests__/utils.test.ts` — formatDate describe block
