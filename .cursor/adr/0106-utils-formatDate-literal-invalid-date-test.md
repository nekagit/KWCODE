# ADR 0106: utils formatDate — test for literal "Invalid Date" string

## Status

Accepted.

## Context

- Night shift task: improve tests (see `.cursor/8. worker/night-shift.md`).
- `src/lib/utils.ts` `formatDate(iso: string)` returns the original string when `new Date(iso)` yields an Invalid Date (NaN getTime()). The literal string `"Invalid Date"` is what `Date.prototype.toString()` returns for invalid dates and can appear from APIs or serialized data. ADR 0100 added a test for invalid calendar date (`"2025-02-30"`); there was no explicit test for the input `"Invalid Date"` itself.

## Decision

- Add one unit test in `src/lib/__tests__/utils.test.ts`: `formatDate("Invalid Date")` returns `"Invalid Date"` (documenting that we pass through the value unchanged when parsing yields Invalid Date).
- No change to production code in `utils.ts`.

## Consequences

- Edge case from real-world API/serialization is covered; behavior is documented.
- Aligns with ADR 0100 and 0104 (formatDate invalid-date tests).

## References

- `src/lib/utils.ts` — `formatDate`
- `src/lib/__tests__/utils.test.ts` — formatDate describe block
- `.cursor/adr/0100-utils-formatDate-invalid-date-test.md`
- `.cursor/adr/0104-utils-formatDate-invalid-date-return-original.md`
