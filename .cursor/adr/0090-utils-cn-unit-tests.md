# ADR 0090: Unit tests for cn() in src/lib/utils.ts

## Status

Accepted.

## Context

- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) used across the app for class names (shadcn/ui, Tailwind). ADR 0089 added unit tests for other utils; `cn` was left untested.
- Night shift preference: improve tests in `src/**/__tests__/*.test.ts` when no TODO/docs task is pending.

## Decision

- Add tests for `cn()` in `src/lib/__tests__/utils.test.ts`:
  - No arguments → empty string.
  - Multiple class strings → merged (contains both).
  - Falsy values (undefined, null, false) → skipped.
  - Conflicting Tailwind utilities (e.g. `px-2` then `px-4`) → tailwind-merge deduplicates (last wins).
- No change to production code in `utils.ts`.

## Consequences

- `cn()` behavior is documented and regressions caught.
- Aligns with existing pattern: one test file per lib module, all exports covered where valuable.

## References

- `src/lib/utils.ts` — implementation
- `src/lib/__tests__/utils.test.ts` — extended with cn tests
- ADR 0089 — utils unit tests (other helpers)
