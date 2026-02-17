# ADR 0101: file-tree-utils — unit tests

## Status

Accepted.

## Context

- `src/lib/file-tree-utils.ts` exports `buildTree(cursorFiles, repoPath)` and `sortNode(node)` used by `cursor-files-tree.tsx` to build the Run-tab file tree from `.cursor` file entries.
- The module had no unit tests; changes to tree building or sorting could regress the UI without detection.

## Decision

- Add `src/lib/__tests__/file-tree-utils.test.ts` with Vitest tests for:
  - **buildTree:** null for empty array; null when no file under repo; single file under `.cursor`; multiple flat files; nested folders (e.g. `.cursor/adr/readme.md`); repo path normalization (trim, trailing slash); children order after sort.
  - **sortNode:** children ordered by type then name (implementation: files first, then folders, then `localeCompare`); recursive sort of nested folder children.
- No change to `file-tree-utils.ts`; tests only.

## Consequences

- Regressions in tree building and sort order are caught by Vitest.
- Aligns with night-shift preference for improving tests and extending coverage for lib code.

## References

- `src/lib/file-tree-utils.ts` — implementation
- `src/lib/__tests__/file-tree-utils.test.ts` — new tests
- `src/components/cursor-files-tree.tsx` — consumer
