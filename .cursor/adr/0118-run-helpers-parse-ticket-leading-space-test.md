# ADR 0118: Run-helpers — parseTicketNumberFromRunLabel leading space test

## Status

Accepted.

## Context

- `parseTicketNumberFromRunLabel` in `src/lib/run-helpers.ts` uses `label?.startsWith("Ticket #")` and `/Ticket #(\d+)/` to extract the ticket number. Labels with leading space (e.g. `" Ticket #5: title"`) do not start with `"Ticket #"`, so the function correctly returns `null`. This behaviour was not explicitly tested.

## Decision

- Add a unit test in `src/lib/__tests__/run-helpers.test.ts` that asserts when the label has leading space, the function returns `null`: e.g. `parseTicketNumberFromRunLabel(" Ticket #5: title")` → `null`, `parseTicketNumberFromRunLabel("  Ticket #1")` → `null`.

## Consequences

- Leading-space behaviour is documented and regression-protected; no change to production code.

## References

- `src/lib/__tests__/run-helpers.test.ts` — new test "returns null when label has leading space (label must start with Ticket #)"
- `src/lib/run-helpers.ts` — implementation under test
- ADR 0114 — Run-helpers parse ticket trailing space test
