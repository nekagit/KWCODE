# ADR 0101 — Unit tests for single run markdown export

## Status

Accepted.

## Context

The module `src/lib/download-run-as-md.ts` provides `downloadRunAsMarkdown` and `copyRunAsMarkdownToClipboard` for the Run tab (ADR 0100). It had no test coverage; the markdown shape (heading, metadata, fenced output, exported timestamp) was only exercised by manual use. Adding unit tests documents expected behaviour and guards against regressions, consistent with other download/markdown modules (download-helpers, csv-helpers, download-all-cursor-prompts-md — ADRs 0085, 0099).

## Decision

- **Export `buildSingleRunMarkdown(entry, exportedAt?)`** from `download-run-as-md.ts`. Builds the full markdown string (section + "Exported at …"). Optional `exportedAt` allows deterministic tests; when omitted, production callers get current time. Both `downloadRunAsMarkdown` and `copyRunAsMarkdownToClipboard` use this builder.
- **Add `src/lib/__tests__/download-run-as-md.test.ts`** — Vitest tests for `buildSingleRunMarkdown`: heading and label; ID and timestamp; fenced output; optional exitCode, durationMs, slot; "(no output)" when output empty/whitespace; exported-at line; deterministic output for same input.

## Consequences

- Single run markdown format is covered by tests; changes to the format can be validated by the test suite.
- Download and copy behaviour unchanged; they delegate to the same builder.
- Run `npm run verify` to confirm tests, build, and lint pass.
