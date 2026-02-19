# ADR 0315 — Bugfix: Command palette "Open first project remote" — proj.repoPath possibly undefined

## Status

Accepted.

## Context

- Production build (`npm run build:desktop` / `next build`) failed with a TypeScript error in `CommandPalette.tsx` at line 1337: `'proj.repoPath' is possibly 'undefined'`.
- The handler for "Open first project's remote" finds the active project with `list?.find((p) => p.repoPath === activeProjects[0])`. The `Project` type defines `repoPath?: string`, so TypeScript correctly treats `proj.repoPath` as `string | undefined` even after the `if (!proj)` check.

## Decision

1. **Guard before use**
   - After ensuring `proj` exists, add an explicit check for `proj.repoPath` before calling `invoke("get_git_info", { projectPath: proj.repoPath.trim() })`.
   - If `proj.repoPath` is missing: show toast "This project has no repo path", close palette, and return. This keeps types safe and gives a clear user message.

## Implementation

- `src/components/shared/CommandPalette.tsx`: Insert block after `if (!proj) { ... return; }`:
  - `if (!proj.repoPath) { toast.info("This project has no repo path"); closePalette(); return; }`
  - Then `proj.repoPath` is narrowed to `string` for the `invoke` call.

## Consequences

- Build passes; no type error.
- Runtime: projects without a repo path get a clear message instead of a potential runtime error if `get_git_info` were called with undefined.
