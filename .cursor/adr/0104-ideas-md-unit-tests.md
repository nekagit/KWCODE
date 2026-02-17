# ADR 0104: ideas-md — unit tests

## Status

Accepted.

## Context

- `src/lib/ideas-md.ts` parses and serializes `.cursor/0. ideas/ideas.md` for the Ideas tab (numbered `#### N. Title` blocks, bullet `- [ ]` lines, and structured `##` sections with `####` ideas).
- The module had no unit tests; changes to parsing or serialization could regress the Ideas UI without detection.

## Decision

- Add `src/lib/__tests__/ideas-md.test.ts` with Vitest tests for:
  - **parseIdeasMd:** empty content; numbered format (`#### N. Title` + body); bullet format (`- [ ]` / `-` lines).
  - **serializeIdeasMd:** bullets format; numbered format with separator.
  - **improvedTextToTitleAndBody:** first line as title / rest as body; single line; stripping `#` from title; trim.
  - **buildNumberedBlock / buildBulletBlock:** shape and raw content; bullet title truncation at 80 chars with ellipsis.
  - **parseIdeasMdStructured:** empty content; no `##` (isStructured false); `##` sections with `####` ideas.
  - **getIdeaFields:** empty body; Problem/Solution; Impact/Effort; only non-empty matches.
- No change to `ideas-md.ts`; tests only.

## Consequences

- Regressions in ideas.md parsing and serialization are caught by Vitest.
- Aligns with night-shift preference for improving tests and extending coverage for lib code.

## References

- `src/lib/ideas-md.ts` — implementation
- `src/lib/__tests__/ideas-md.test.ts` — new tests
