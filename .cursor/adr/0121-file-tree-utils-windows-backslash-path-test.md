# ADR 0121: file-tree-utils — Windows backslash path normalization test

## Status

Accepted.

## Context

- `src/lib/file-tree-utils.ts` uses `normalizePath` from `@/lib/utils` on both `repoPath` and each file path, so Windows-style backslash paths (e.g. `C:\repo`, `C:\repo\.cursor\foo.md`) are normalized to forward slashes before building the tree.
- The existing file-tree-utils tests did not cover this behavior; coverage for path normalization was limited to trim and trailing slash.

## Decision

- Add one test in `src/lib/__tests__/file-tree-utils.test.ts`: **"normalizes Windows-style backslash paths (repo and file paths)"** — pass `repoPath: "C:\\repo"` and a file with `path: "C:\\repo\\.cursor\\foo.md"`, assert the tree is built with one file `.cursor/foo.md`.
- No change to `file-tree-utils.ts`; test only.

## Consequences

- Documents and guards the behavior that `buildTree` works with Windows-style paths via `normalizePath`.
- Aligns with night-shift preference for improving tests and extending coverage for lib code.

## References

- `src/lib/file-tree-utils.ts` — uses `normalizePath(repoPath.trim().replace(/\/$/, ""))` and `normalizePath(f.path)`
- `src/lib/utils.ts` — `normalizePath(p)` replaces `\` with `/`
- `src/lib/__tests__/file-tree-utils.test.ts` — new test case
