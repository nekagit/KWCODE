# ADR 0107: Utils — humanizeAgentId consecutive-separators test

## Status

Accepted.

## Context

`humanizeAgentId` in `src/lib/utils.ts` splits on `[-_]` and title-cases each segment. Agent IDs in practice use single hyphens (e.g. `frontend-dev`), but the implementation allows consecutive separators (e.g. `frontend--dev` or `a__b`), which produce empty segments and thus extra spaces in the output. This behavior was untested and could regress if the implementation changed.

## Decision

- Add two unit tests in `src/lib/__tests__/utils.test.ts` for `humanizeAgentId`:
  - Consecutive double hyphen: `"frontend--dev"` → `"Frontend  Dev"`.
  - Consecutive underscores: `"a__b"` → `"A  B"`.
- No change to `utils.ts` behavior; tests document and lock current behavior.

## Consequences

- Edge-case behavior of `humanizeAgentId` is documented and covered by tests.
- Future refactors that alter split/map/join will be caught if they change this output.

## References

- `src/lib/utils.ts` — `humanizeAgentId`
- `src/lib/__tests__/utils.test.ts` — humanizeAgentId describe block
