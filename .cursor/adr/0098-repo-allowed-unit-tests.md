# ADR 0098: repo-allowed — unit tests

## Status

Accepted.

## Context

- `src/lib/repo-allowed.ts` exports `repoAllowed(resolvedRepo, cwd)` used to decide whether a project repo path is allowed for API access (read/write files, analyze, etc.). It allows repos inside the app directory or sibling directories (same parent).
- The module had no unit tests; changes to path logic could regress security or break valid access.

## Decision

- Add `src/lib/__tests__/repo-allowed.test.ts` with Vitest tests for:
  - Repo inside app directory (same path or subdirectory of cwd) → true.
  - Repo as sibling of cwd (same parent directory) → true.
  - Repo in unrelated path or parent-of-cwd (not under cwd, not sibling) → false.
- No change to `repo-allowed.ts`; tests only.

## Consequences

- Regressions in allowed-path logic are caught by Vitest.
- Aligns with night-shift preference for improving tests and extending coverage for lib code.

## References

- `src/lib/repo-allowed.ts` — implementation
- `src/lib/__tests__/repo-allowed.test.ts` — new tests
