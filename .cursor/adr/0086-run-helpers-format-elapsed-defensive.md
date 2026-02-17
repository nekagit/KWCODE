# ADR 0086: run-helpers — formatElapsed defensive handling for NaN and negative

## Status

Accepted.

## Context

- `formatElapsed(seconds)` in `src/lib/run-helpers.ts` is used by terminal slot UI (`TerminalSlot.tsx`) to display elapsed/done duration. If callers pass `NaN` or negative values (e.g. from timing bugs), the previous implementation produced `"NaNs"` or `"-5s"`, which is confusing in the UI.
- ADR 0085 added edge-case tests for `formatElapsed` (fractional seconds, long runs); defensive edge cases (NaN, negative) were not covered.

## Decision

- **Harden `formatElapsed`**: Treat non-finite or negative `seconds` as `0`, so output is always `"0s"` in those cases.
- **Extend tests**: In `src/lib/__tests__/run-helpers.test.ts`, add tests that `formatElapsed(NaN)` and `formatElapsed(negative)` return `"0s"`.
- **parseTicketNumberFromRunLabel**: Add tests for labels `"Ticket #: no number"` and `"Ticket #"` (no number) returning `null` to document and guard behavior.

## Consequences

- Terminal slot UI never shows "NaNs" or negative elapsed times.
- Edge cases are regression-protected by unit tests.
- Production code change is minimal (one function in run-helpers.ts).

## References

- `src/lib/run-helpers.ts` — `formatElapsed` implementation
- `src/lib/__tests__/run-helpers.test.ts` — new edge-case tests
- ADR 0085 — run-helpers edge-case tests (formatElapsed fractional, parseTicketNumber boundaries)
