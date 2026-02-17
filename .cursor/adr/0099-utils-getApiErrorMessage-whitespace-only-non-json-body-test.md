# ADR 0099: getApiErrorMessage — whitespace-only non-JSON body test

## Status

Accepted.

## Context

- `getApiErrorMessage` in `src/lib/utils.ts` parses the response body as JSON when possible; if not JSON or if JSON has no usable `error`/`detail`, it uses trimmed body text or falls back to status-based message (`res.status === 500 ? FRIENDLY_500 : res.statusText || "Request failed"`).
- When the body is **non-JSON** and **whitespace-only** (e.g. `"   \n\t  "`), `text?.trim()` is empty, so the code skips the trimmed-body branch and returns the status-based message. This path was not explicitly tested.

## Decision

- Add one test in `src/lib/__tests__/utils.test.ts`: "returns status-based message when body is whitespace-only non-JSON" — two cases:
  1. Status 500 with body `"   \n\t  "` → "Server error loading data".
  2. Status 404 with body `"   "` and statusText "Not Found" → "Not Found".
- No change to production code.

## Consequences

- Fallback behaviour for whitespace-only non-JSON bodies is documented and regression-protected.
- Complements ADR 0094 (whitespace-only JSON `error`/`detail`); this covers the non-JSON branch.

## References

- `src/lib/utils.ts` — `getApiErrorMessage` (lines 32–37: `if (text?.trim())` and final return)
- `src/lib/__tests__/utils.test.ts` — new test
- ADR 0094 — whitespace-only error/detail (JSON path)
