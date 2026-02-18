# ADR 0099: Unit tests for cursor prompts markdown export

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

The module `src/lib/download-all-cursor-prompts-md.ts` provides download and copy-as-markdown for all `.cursor` prompt files. It had no unit test coverage. Other download/markdown modules (download-helpers, csv-helpers, architecture-to-markdown, design-to-markdown) have Vitest tests that document expected output and guard against regressions (ADRs 0085, 0086, 0087).

## Decision

- **Export `buildCursorPromptsMarkdown(files, exportedAt)`** from `download-all-cursor-prompts-md.ts` so the markdown builder can be unit-tested without mocking fetch or clipboard. Refactor `downloadAllCursorPromptsAsMarkdown` and `copyAllCursorPromptsAsMarkdownToClipboard` to use this builder.
- **Add `src/lib/__tests__/download-all-cursor-prompts-md.test.ts`** — Vitest tests for `buildCursorPromptsMarkdown`: title and exported timestamp; one file (heading, Updated, content); escaped `#` in path; multiple files in order; trimmed content; deterministic output; empty files array.

## Consequences

- Regression safety and documented behaviour for the cursor prompts markdown format.
- Same pattern as other markdown export tests; no change to public download/copy behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
