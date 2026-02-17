# ADR 0115: Utils — scatter mod-zero defensive

## Status

Accepted.

## Context

`scatter(i, prime, mod)` in `src/lib/utils.ts` returns `((i * prime) % mod) / mod` for pseudo-random values in [0, 1). When `mod === 0`, the expression divides by zero and throws. Callers (e.g. `RaindropCircle.tsx`, `FlyingStarItem.tsx`) always pass positive `mod`, but the function is a public helper and could be called with `mod === 0` by mistake or from future code.

## Decision

- In `src/lib/utils.ts`: if `mod === 0`, return `0` before computing (avoids division by zero; 0 is in [0, 1) and is a safe fallback).
- Add unit tests in `src/lib/__tests__/utils.test.ts`: `scatter(0, 7, 0)` and `scatter(5, 11, 0)` both return `0`.

## Consequences

- `scatter` is safe when `mod` is 0; no runtime throw.
- Behavior is documented and locked by tests.

## References

- `src/lib/utils.ts` — `scatter`
- `src/lib/__tests__/utils.test.ts` — scatter describe block
