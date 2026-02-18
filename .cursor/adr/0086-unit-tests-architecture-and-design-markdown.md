# ADR 0086: Unit tests for architecture-to-markdown and design-to-markdown

## Status

Accepted. Implemented 2025-02-18 (night shift test phase).

## Context

The markdown export modules `src/lib/architecture-to-markdown.ts` and `src/lib/design-to-markdown.ts` are used by Project Spec and design exports (e.g. `download-architecture-record`, `download-design-record`). They had no unit tests: architecture tests were added in a prior session; design-to-markdown had no coverage. Tests document expected output shape and guard against regressions when changing export format.

## Decision

- **Add or extend Vitest unit tests** for both modules:
  - **`src/lib/__tests__/architecture-to-markdown.test.ts`** — Tests for `architectureRecordToMarkdown`: minimal and full `ArchitectureRecord` fixtures; heading, metadata, optional sections (practices, scenarios, references, anti_patterns, examples, extra_inputs), footer. (Already present; plan confirmed completeness.)
  - **`src/lib/__tests__/design-to-markdown.test.ts`** — Tests for `designConfigToMarkdown` and `designRecordToMarkdown`: minimal valid `DesignConfig`/`DesignRecordForExport`; assert title, project/template, colors table, typography, layout, sections order and enabled filter, footer; record header and embedded config.

- **Conventions**: Same layout and style as existing `src/lib/__tests__/*.test.ts` (Vitest, describe/it/expect, behaviour-focused assertions). No changes to production code.

## Consequences

- Regressions in architecture or design markdown export format are caught by tests.
- Expected output structure is documented via test cases.
- Future changes to these modules can be made with confidence. Run `npm run verify` to execute tests, build, and lint.
