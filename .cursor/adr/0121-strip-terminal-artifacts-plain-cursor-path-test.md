# ADR 0121: strip-terminal-artifacts — test for plain .cursor path format

## Status

Accepted.

## Context

- `strip-terminal-artifacts.ts` has two patterns for .cursor path artifact lines:
  - Backtick format: `**\`.cursor/...\`** — ...` (already tested in 0095 / existing tests).
  - Plain format: `.cursor/... — ...` via `/^\.cursor\/[\s\S]*\s+[—–-]\s/i`. The plain format had no dedicated test.

## Decision

- Add one test in `src/lib/__tests__/strip-terminal-artifacts.test.ts`:
  - **Plain .cursor path:** "strips .cursor path line in plain format (.cursor/path — ...)" — assert that a line like `.cursor/1. project/design.md — updated` is stripped and document content (e.g. `# Design\nContent`) is preserved.
- Rename the existing test to clarify it covers the backtick format: "strips .cursor path line with em dash (backtick format)".
- No change to `strip-terminal-artifacts.ts`; tests only.

## Consequences

- Explicit coverage for the plain `.cursor/path — ...` artifact pattern; future changes to that regex are guarded by tests.
- Aligns with night-shift preference for improving tests and extending coverage.

## References

- `src/lib/strip-terminal-artifacts.ts` — implementation (TERMINAL_ARTIFACT_PATTERNS)
- `src/lib/__tests__/strip-terminal-artifacts.test.ts` — tests
