# ADR 0092: getApiErrorMessage — empty error and empty JSON body tests

## Status

Accepted.

## Context

- `getApiErrorMessage` in `src/lib/utils.ts` uses JSON `error`/`detail` when present and string; otherwise falls back to trimmed body or status.
- ADR 0091 extended tests for several branches; two edge cases were not yet covered:
  - **Empty string `error`**: `{"error":""}` — the code treats `""` as falsy and does not use it as the message, so it falls back to the trimmed body.
  - **Empty JSON body with status 500**: `{}` with status 500 — no `error`/`detail`, so fallback returns trimmed body `"{}"` (friendly 500 is only used when body is empty or equals "Internal Server Error").

## Decision

- Add two tests in `src/lib/__tests__/utils.test.ts`:
  1. **Empty string error**: `getApiErrorMessage(Response('{"error":""}'))` → returns trimmed body `'{"error":""}'` (documents that empty string is not used as message).
  2. **Empty JSON object with 500**: `getApiErrorMessage(Response("{}", { status: 500 }))` → returns `"{}"` (documents that friendly 500 is not used when body has content).
- No change to production code.

## Consequences

- Edge-case behaviour of `getApiErrorMessage` is documented and regression-protected.
- Night-shift task: one concrete test improvement, no scope creep.

## References

- `src/lib/utils.ts` — `getApiErrorMessage`
- `src/lib/__tests__/utils.test.ts` — new tests
- ADR 0091 — extended getApiErrorMessage tests
