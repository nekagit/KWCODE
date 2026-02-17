# ADR 0095: strip-terminal-artifacts — unit tests

## Status

Accepted.

## Context

- `src/lib/strip-terminal-artifacts.ts` provides `stripTerminalArtifacts()` and `MIN_DOCUMENT_LENGTH`. It is used by `run-store-hydration.tsx`, `analyze-project-doc` API, and `clean-analysis-docs` API to remove terminal/agent log lines from raw output so written .md files contain only document content.
- The module had no unit tests; changes to patterns or summary-block logic could regress without detection.

## Decision

- Add `src/lib/__tests__/strip-terminal-artifacts.test.ts` with Vitest tests for:
  - Empty input; preserving document content (headings + body).
  - Stripping artifact lines: box-drawing/dashes, Implement All terminal slot, Project path, cd into project path, running agent, .cursor path with em dash.
  - Summary blocks: "Summary of what was done" (skip until done/agent exited or box-drawing); "Summary of what's in place" (skip until document start heading).
  - Deduplication of consecutive identical trimmed lines; trimming leading/trailing blank lines.
  - `MIN_DOCUMENT_LENGTH` export value.
- No change to `strip-terminal-artifacts.ts`; tests only.

## Consequences

- Regressions in artifact patterns or summary-block logic are caught by Vitest.
- Aligns with night-shift preference for improving tests and extending coverage for used lib code.

## References

- `src/lib/strip-terminal-artifacts.ts` — implementation
- `src/lib/__tests__/strip-terminal-artifacts.test.ts` — new tests
- `src/store/run-store-hydration.tsx`, `src/app/api/analyze-project-doc/route.ts`, `src/app/api/clean-analysis-docs/route.ts` — callers
