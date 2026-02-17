# ADR 0111: strip-terminal-artifacts — tests for → /path and cd /path patterns

## Status

Accepted.

## Context

- `strip-terminal-artifacts.ts` uses `TERMINAL_ARTIFACT_PATTERNS` including `^[→]\s+\//` ("→ /path") and `^cd\s+\/[\s\S]*$/i` ("cd /path"). These were not covered by dedicated unit tests; coverage was extended for "cd into project path" and similar lines but not for the arrow and literal "cd /path" forms.

## Decision

- Add two tests in `src/lib/__tests__/strip-terminal-artifacts.test.ts`:
  - **Arrow path:** "strips arrow path line (→ /path)" — assert that a line like `→ /Users/me/project` is stripped and document content is preserved.
  - **cd /path:** "strips cd /path line" — assert that a line like `cd /home/user/repo` is stripped and document content is preserved.
- No change to `strip-terminal-artifacts.ts`; tests only.

## Consequences

- Explicit coverage for the → /path and cd /path artifact patterns; future changes to these regexes are guarded by tests.
- Aligns with night-shift preference for improving tests and extending coverage.

## References

- `src/lib/strip-terminal-artifacts.ts` — implementation (TERMINAL_ARTIFACT_PATTERNS)
- `src/lib/__tests__/strip-terminal-artifacts.test.ts` — tests
