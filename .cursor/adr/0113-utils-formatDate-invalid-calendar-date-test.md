# ADR 0113: utils formatDate — invalid calendar date test fix

## Context

The `formatDate` unit test for invalid calendar date (e.g. "2025-02-30") had a misleading description ("formats ... as locale Invalid Date string") and only asserted `typeof result === "string"` and `result.length > 0`. The implementation returns the original `iso` string when `new Date(iso)` yields Invalid Date (`getTime()` is NaN), so the test did not document the actual contract.

## Decision

- Rename the test to: "returns original string for invalid calendar date (e.g. Feb 30)".
- Assert explicitly: `expect(formatDate("2025-02-30")).toBe("2025-02-30")`.

## Consequences

- Test accurately documents that invalid calendar dates are passed through unchanged.
- No change to production code; test-only improvement (night shift task).
