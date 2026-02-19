# ADR 0323 — Test phase: Unit tests for parse-first-remote-url

## Status

Accepted.

## Context

- The `parseFirstRemoteUrl(remotes: string)` function in `src/lib/parse-first-remote-url.ts` parses `git remote -v` output and returns the first http(s) URL. It is used by the CommandPalette to open the first project's Git remote in the browser.
- The module had no unit tests. Parsing behaviour and edge cases (empty input, multiple remotes, .git stripping, non-http URLs) were undocumented and at risk of regression.

## Decision

1. **Add unit tests**  
   - Add `src/lib/__tests__/parse-first-remote-url.test.ts` covering:
     - Typical git remote -v output (first URL returned, .git suffix stripped).
     - Empty string and whitespace-only input return null.
     - Multiple remotes: first URL wins.
     - URL without .git suffix left unchanged.
     - Input with no http(s) URL (e.g. SSH only) returns null.
     - Defensive behaviour for null/undefined (non-string) input.
     - Single-line and multi-line input; leading/trailing whitespace trimmed before matching.

2. **No production code changes**  
   - `parse-first-remote-url.ts` remains unchanged; tests document and guard existing behaviour.

## Consequences

- Parse behaviour for git remote output is documented and regression-safe.
- Same test-phase pattern as print-page, copy-to-clipboard, and copy-app-version.
- No new dependencies; Vitest only.
