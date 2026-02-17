# ADR 0091: Extended unit tests for getApiErrorMessage (utils)

## Status

Accepted.

## Context

- ADR 0089 introduced `src/lib/__tests__/utils.test.ts` with initial coverage for `getApiErrorMessage`.
- The helper has several branches: JSON `error`/`detail`, "Internal Server Error" normalization (both in JSON and plain text), non-JSON body, empty body with status/statusText fallbacks.
- Extending tests for these edge cases reduces regression risk and documents expected behaviour.

## Decision

- Extend `getApiErrorMessage` tests in `src/lib/__tests__/utils.test.ts` with:
  - Prefer **error** over **detail** when both are present in JSON.
  - **detail** "Internal Server Error" → friendly message (same as for `error`).
  - **Non-JSON** response with plain text → return trimmed body (max 200 chars).
  - Non-JSON body equal to "Internal Server Error" (trimmed) → friendly message.
  - Empty body and empty **statusText** → "Request failed" (deterministic via `statusText: ""`).
  - **Non-string `error`** (e.g. `{"error":500}`) → ignored; return trimmed body so behaviour is documented and regression-proof.
  - **Non-string `detail`** (e.g. `{"detail":{}}`) → ignored; fall back to trimmed body.
- No change to production code in `src/lib/utils.ts`.

## Consequences

- Better coverage of API error parsing and user-facing message behaviour.
- Tests remain fast and deterministic (e.g. explicit `statusText: ""` for fallback case).

## References

- `src/lib/utils.ts` — `getApiErrorMessage` implementation
- `src/lib/__tests__/utils.test.ts` — extended tests
- ADR 0089 — initial utils unit tests
