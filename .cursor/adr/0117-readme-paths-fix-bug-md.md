# ADR 0117: Add fix-bug.md to Paths the app expects in .cursor/README.md

## Status

Accepted.

## Context

The app uses `.cursor/8. worker/fix-bug.md` (via `WORKER_FIX_BUG_PROMPT_PATH` in `src/lib/cursor-paths.ts`) for the Run tab "Fix bug" flow. The Structure table in `.cursor/README.md` already listed fix-bug.md under 8. worker/, but the "Paths the app expects" section only listed implement-all.md and night-shift.md, so fix-bug.md was missing from the canonical paths list.

## Decision

- Add **`.cursor/8. worker/fix-bug.md`** to the "Paths the app expects" list in `.cursor/README.md`, with a short description: "Run tab (Fix bug) prompt".

## Consequences

- The paths list is complete for 8. worker prompts (implement-all, fix-bug, night-shift).
- Contributors and agents know not to remove or rename fix-bug.md when customizing the project.

## References

- `.cursor/README.md` — Paths the app expects
- `src/lib/cursor-paths.ts` — WORKER_FIX_BUG_PROMPT_PATH
