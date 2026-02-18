# ADR 0085: Consolidate duplicate ADR 0008 (download helpers)

## Status

Accepted. Implemented 2025-02-18 (night shift refactor).

## Context

Two files in `.cursor/adr/` both carried the number 0008 and described the same decision (shared download helpers in `src/lib/download-helpers.ts`):

- `0008-download-helpers-refactor.md` — "Shared download helpers refactor"
- `0008-unify-download-helpers.md` — "Unify download filename and blob-download helpers"

Having two ADRs with the same number and overlapping content caused ambiguity about the single source of truth and made it unclear which file to update or reference.

## Decision

- **Canonical ADR**  
  `0008-download-helpers-refactor.md` remains the single source of truth for the download-helpers decision. Its content is unchanged.

- **Duplicate file**  
  `0008-unify-download-helpers.md` is replaced with a short pointer that states the canonical ADR and that the file is retained only to avoid broken references. No duplicated decision content remains in that file.

## Consequences

- One clear ADR (0008-download-helpers-refactor) for the download-helpers decision.
- No duplicate content; future updates go in the canonical file only.
- Refactor-only: no code or behaviour change; documentation structure improved.
