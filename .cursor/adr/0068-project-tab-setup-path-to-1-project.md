# ADR 0068: Project tab — prompt and doc paths use .cursor/1. project (not .cursor/setup)

## Status

Accepted

## Context

- ADR 0026 migrated setup content from `.cursor/2. setup` into `.cursor/1. project`; `cursor-paths.ts` already uses `PROJECT_ROOT` (`.cursor/1. project`) for design, architecture, testing, documentation, frontend, backend.
- When running a prompt (e.g. design creation) from the project tab, output was still being saved to `.cursor/setup` in some cases because prompt files and documentation instructed the AI or user to save to `.cursor/setup/*.md` instead of `.cursor/1. project/*.md`.
- Canonical paths for app behavior are in `src/lib/cursor-paths.ts`; prompt text and docs must match so that Analyze and copy-paste flows write to the same paths.

## Decision

- **Use `.cursor/1. project` everywhere** for design, architecture, testing, documentation, frontend, backend (docs and outputs). Use `.cursor/0. ideas` for `ideas.md`.
- **Update all prompt files** under `.cursor` that referenced `.cursor/setup` to reference `.cursor/1. project` or `.cursor/0. ideas` as appropriate: `design.prompt.md`, `architecture.prompt.md`, `ideas.prompt.md`, `documentation.prompt.md`, frontend/backend/testing prompts, and agent files in `.cursor/2. agents/`.
- **Update docs and scripts** that mentioned `.cursor/setup`: `docs/cursor-setup-prompts.md`, `docs/guides/usage-guide.md`, `docs/guides/testing.md`, `docs/architecture/*`, `docs/api/README.md`, `docs/getting-started/configuration.md`, `script/setup-documentation.sh`, `script/initialize-project.sh`.
- No change to `cursor-paths.ts` (already correct); change is limited to prompt content and documentation so that run/Analyze and manual prompt usage both write to `.cursor/1. project` (and `.cursor/0. ideas` for ideas).

## Consequences

- Running design/architecture/testing/documentation prompts (Analyze or copy-paste) saves output to `.cursor/1. project/`; ideas to `.cursor/0. ideas/ideas.md`. No output under `.cursor/setup`.
- Single source of truth for paths remains `cursor-paths.ts`; prompts and docs are aligned with it for consistency and AI-assisted workflows.

## References

- `src/lib/cursor-paths.ts` — `PROJECT_ROOT`, `getOutputPath`, `getSetupDocPath`
- `.cursor/1. project/*.prompt.md`, `.cursor/0. ideas/ideas.prompt.md`, `.cursor/11. documentation/documentation.prompt.md`, `.cursor/3. frontend/`, `.cursor/4. backend/`, `.cursor/5. testing/*.prompt.md`, `.cursor/2. agents/*.md`
- `docs/cursor-setup-prompts.md`, `docs/guides/usage-guide.md`, `script/setup-documentation.sh`, `script/initialize-project.sh`
- ADR 0026 (setup tab removal; 2. setup → 1. project)
