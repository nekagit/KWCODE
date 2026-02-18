# ADR 0085: Unit tests for download-helpers and csv-helpers

## Status

Accepted. Implemented 2025-02-18 (night shift test phase).

## Context

The shared modules `src/lib/download-helpers.ts` and `src/lib/csv-helpers.ts` were introduced in recent refactors (ADR 0008/0084 and ADR 0009) and are used across many download/export libs. They had no unit tests, which increased the risk of regressions when changing sanitization or CSV escaping behaviour.

## Decision

- **Add Vitest unit tests** for both modules:
  - **`src/lib/__tests__/download-helpers.test.ts`** — Tests for `safeFilenameSegment`, `safeNameForFile`, and `filenameTimestamp`. `downloadBlob` and `triggerFileDownload` are not tested in Node (they require DOM); behaviour is straightforward (createObjectURL, anchor click, revoke).
  - **`src/lib/__tests__/csv-helpers.test.ts`** — Tests for `escapeCsvField`: plain values unchanged, comma/newline/double-quote trigger quoting, internal quotes doubled, null/undefined stringified to empty.

- **Conventions**: Same layout and style as existing `src/lib/__tests__/*.test.ts` (Vitest, describe/it/expect, behaviour-focused assertions).

## Consequences

- Regressions in filename sanitization or CSV escaping are caught by tests.
- Expected behaviour is documented via test cases.
- Future changes to these helpers can be made with confidence. Run `npm run verify` to execute tests, build, and lint.
