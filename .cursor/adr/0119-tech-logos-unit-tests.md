# ADR 0119: tech-logos — unit tests

## Status

Accepted.

## Context

- `src/lib/tech-logos.ts` exports `getTechLogoUrl(label)` and `getTechLogoSlug(label)` used to map tech names (e.g. from tech-stack.json) to Simple Icons CDN URLs/slugs for badges and logos on the Technologies page.
- The module had no unit tests; changes to the mapping or fallback logic could regress UI or break unknown labels.

## Decision

- Add `src/lib/__tests__/tech-logos.test.ts` with Vitest tests for:
  - `getTechLogoUrl`: exact label → CDN URL; compound label (first-word fallback) → URL; trim; empty/falsy/non-string → null; unknown label → null.
  - `getTechLogoSlug`: same cases for slug return value.
- No change to `tech-logos.ts`; tests only.

## Consequences

- Regressions in tech logo resolution are caught by Vitest.
- Aligns with night-shift preference for improving tests and extending coverage for lib code.

## References

- `src/lib/tech-logos.ts` — implementation
- `src/lib/__tests__/tech-logos.test.ts` — new tests
