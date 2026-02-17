# ADR 0094: getApiErrorMessage — whitespace-only error/detail tests

## Status

Accepted.

## Context

- `getApiErrorMessage` in `src/lib/utils.ts` uses JSON `error` or `detail` when present and non-empty string; otherwise falls back to trimmed body or status.
- ADR 0092 covered empty string `error` and empty JSON body. Whitespace-only strings (e.g. `"   "`, `"\t\n"`) were not explicitly tested: the code treats them as truthy and returns them as the message (no trim).

## Decision

- Add two tests in `src/lib/__tests__/utils.test.ts`:
  1. **Whitespace-only error**: `getApiErrorMessage(Response('{"error":"   "}'))` → returns `"   "` (documents that whitespace-only is returned as-is, not treated as missing).
  2. **Whitespace-only detail**: `getApiErrorMessage(Response('{"detail":"\t\n"}', { status: 400 }))` → returns `"\t\n"`.
- No change to production code.

## Consequences

- Edge-case behaviour for whitespace-only `error`/`detail` is documented and regression-protected.
- Night-shift task: one concrete test improvement, no scope creep.

## References

- `src/lib/utils.ts` — `getApiErrorMessage`
- `src/lib/__tests__/utils.test.ts` — new tests
- ADR 0092 — empty error and JSON body tests
