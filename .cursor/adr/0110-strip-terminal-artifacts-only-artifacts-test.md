# ADR 0110: strip-terminal-artifacts — only-artifacts edge-case test

## Status

Accepted.

## Context

- `stripTerminalArtifacts()` in `src/lib/strip-terminal-artifacts.ts` strips terminal/agent log lines so output contains only document content. When input has no document content (e.g. only "Implement All – Terminal slot 1", "Project: /path", etc.), the result should be an empty string.
- ADR 0095 added the initial unit tests; this edge case (input with only artifact lines) was not explicitly covered.

## Decision

- Add one test in `src/lib/__tests__/strip-terminal-artifacts.test.ts`: "returns empty string when input contains only artifact lines (no document content)".
- Input: several artifact lines (Implement All terminal slot, Project path, cd into project path, running agent). Expected: `""`.
- No change to `strip-terminal-artifacts.ts`; test only.

## Consequences

- Behavior when raw output contains no heading/document content is documented and regression-protected.
- Aligns with night-shift preference for improving tests and extending coverage.

## References

- `src/lib/strip-terminal-artifacts.ts` — implementation
- `src/lib/__tests__/strip-terminal-artifacts.test.ts` — test added
- ADR 0095 — initial strip-terminal-artifacts unit tests
