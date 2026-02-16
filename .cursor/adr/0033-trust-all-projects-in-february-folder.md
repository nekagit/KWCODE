# ADR 0033: Trust all projects in February folder

## Status

Accepted

## Context

- The app (KW-February-KWCode) manages multiple projects; project repos may live in the same parent folder (e.g. `Documents/February/`) as sibling directories (KW-February-ViralSync, KW-February-Soladia, etc.).
- API routes that access project repo files (read/write file, list files, analyze docs) previously used a strict check: `resolvedRepo.startsWith(cwd)`, so only repos *inside* the app directory were allowed. Sibling projects under the same parent folder (February) were rejected with 403.

## Decision

- **Single source of truth:** Introduce a shared `repoAllowed(resolvedRepo, cwd)` in `src/lib/repo-allowed.ts`.
- **Allowed repos:** A repo is allowed if (1) it is under the app directory (`resolvedRepo.startsWith(cwdResolved)`), or (2) it is a **sibling** of the app directory (`path.dirname(resolvedRepo) === path.dirname(cwdResolved)`). That way all projects in the same parent folder (e.g. February) are trusted.
- **Use everywhere:** Use `repoAllowed` in all API routes that validate project repo path: `file/route.ts`, `files/route.ts`, `analyze-project-doc/route.ts`, `clean-analysis-docs/route.ts`. Remove duplicate local `repoAllowed` implementations from the latter two.

## Consequences

- Projects in the February folder (or any folder that contains the app as one of its subdirs) can be opened in the app and used for file access, analysis, and Implement All without 403.
- Security remains bounded: only the app directory or its siblings are allowed; arbitrary paths elsewhere are still rejected.

## References

- `src/lib/repo-allowed.ts` — shared helper
- `src/app/api/data/projects/[id]/file/route.ts` — GET/POST use `repoAllowed`
- `src/app/api/data/projects/[id]/files/route.ts` — GET uses `repoAllowed`
- `src/app/api/analyze-project-doc/route.ts` — uses shared `repoAllowed`
- `src/app/api/clean-analysis-docs/route.ts` — uses shared `repoAllowed`
