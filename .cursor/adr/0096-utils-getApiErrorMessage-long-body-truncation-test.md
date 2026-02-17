# ADR 0096: getApiErrorMessage — long non-JSON body truncation test

## Status

Accepted.

## Context

- `getApiErrorMessage` in `src/lib/utils.ts` trims non-JSON response body and slices it to 200 characters (`text.trim().slice(0, 200)`).
- Existing tests cover JSON `error`/`detail`, empty body, and short plain-text body; the 200-character truncation for long plain-text bodies was not explicitly tested.

## Decision

- Add one test in `src/lib/__tests__/utils.test.ts`: a response with a non-JSON body longer than 200 characters (e.g. 300) is truncated to exactly 200 characters.
- No change to production code.

## Consequences

- Truncation behaviour for long error bodies is documented and regression-protected.
- Single, contained test addition; no scope creep.

## References

- `src/lib/utils.ts` — `getApiErrorMessage` (line 33: `trimmed = text.trim().slice(0, 200)`)
- `src/lib/__tests__/utils.test.ts` — new test "truncates long non-JSON body to 200 characters"
