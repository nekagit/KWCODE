# ADR 0041: Docs and templates align with .cursor/2. agents and Implement All path

## Status

Accepted.

## Context

ADR 0040 established a single Implement All prompt at `.cursor/8. worker/implement-all.md` and use of `.cursor/2. agents` everywhere in code. Documentation, templates, and agent instruction files still referenced `.cursor/agents`, `.cursor/prompts/worker.md`, and `script/implement_all.sh`, causing confusion and inconsistency.

## Decision

- **Documentation:** Update all user-facing and internal docs to reference `.cursor/2. agents` (not `.cursor/agents`) and `.cursor/8. worker/implement-all.md` (not `.cursor/prompts/worker.md`) where describing agent list or Run tab base prompt. Updated: `docs/development/workflows.md`, `docs/guides/usage-guide.md`, `docs/development/agents-guide.md`, `docs/guides/testing.md`, `docs/development/setup.md`, `docs/cursor-setup-prompts.md`.
- **.cursor and .cursor_template:** Update `.cursor/README.md` and `.cursor_template/README.md` (paths table and “paths the app expects”); `.cursor_template/prompts/worker.md` (agent path and note about implement-all.md).
- **Agent instruction files:** In `.cursor/2. agents/` and `.cursor_template/agents/`, replace internal cross-references from `.cursor/agents/` to `.cursor/2. agents/` (e.g. frontend-dev.md, solution-architect.md); replace `script/implement_all.sh` with `script/worker/implement_all.sh` in backend-dev.md.
- **Prompts and templates:** `.cursor_template/1. project/development/feature-implementation.prompt.md`, `.cursor_template/7. planner/ticket-templates/feature-ticket.template.md`, and documentation.prompt.md (both in .cursor and .cursor_template): agent path → `.cursor/2. agents`.
- **Ideas and ADR 0009:** `.cursor/0. ideas/ideas.md` — agent path in AI Integration idea; ADR 0009 — update to reference ADR 0040 and current paths (implement-all.md, 2. agents).

## Consequences

- Documentation and templates match the app behavior (AGENTS_ROOT, WORKER_IMPLEMENT_ALL_PROMPT_PATH).
- New and existing users see consistent paths; agent cross-references and script paths in agent docs are correct.
- ADR 0009 remains the standard for “one worker prompt”; ADR 0040/0041 document the actual paths.

## References

- ADR 0040: Implement All minimal script and .cursor/2. agents everywhere.
- `src/lib/cursor-paths.ts` — AGENTS_ROOT, WORKER_IMPLEMENT_ALL_PROMPT_PATH.
