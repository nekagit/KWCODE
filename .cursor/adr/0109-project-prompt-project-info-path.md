# ADR 0109: Project prompt — PROJECT-INFO.md output path corrected to .cursor/1. project

## Status

Accepted

## Context

- The app and `src/lib/cursor-paths.ts` expect project info output at `.cursor/1. project/PROJECT-INFO.md` (see `.cursor/README.md` "Paths the app expects").
- `.cursor/1. project/project.prompt.md` instructed users/AI to generate or update `.cursor/project/PROJECT-INFO.md`, which is wrong: there is no `.cursor/project/` folder; the canonical location is `.cursor/1. project/`.

## Decision

- **Update** `.cursor/1. project/project.prompt.md` so the first line references `.cursor/1. project/PROJECT-INFO.md` instead of `.cursor/project/PROJECT-INFO.md`.
- No code changes; prompt text only.

## Consequences

- Running the project prompt (or following its instructions) will direct output to the path the app expects, keeping prompts aligned with `cursor-paths.ts` and README.

## References

- `.cursor/1. project/project.prompt.md`
- `.cursor/README.md` — Paths the app expects
- `src/lib/cursor-paths.ts` — `PROJECT_OUTPUT_PATH`, `getOutputPath("project")`
- ADR 0068 (project tab paths use .cursor/1. project)
