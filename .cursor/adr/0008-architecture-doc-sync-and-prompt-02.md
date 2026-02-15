# ADR 0008: Architecture document sync and Prompt 02 alignment

## Status

Accepted

## Context

The single source of truth for structure, data flow, and technical decisions is `.cursor/setup/architecture.md`. The document needed to (1) reflect the current repo layout and API surface, (2) align with the standard “Prompt 02: Generate architecture.md” structure and formatting, and (3) stay accurate for onboarding and AI-assisted development.

## Decision

- **Update architecture.md** in `.cursor/setup/` with:
  - **Version/date:** Last Updated set to 2026-02-15.
  - **Project context:** Package name `run-prompts` and current framework/runtime description.
  - **Directory tree:** Synced with actual `src/app/api` routes (e.g. `analyze-project-doc`, `data/projects/[id]/improve-idea`, `data/technologies`, `data/cursor-init-template`, `data/dashboard-metrics`; removed non-existent `february-repos-overview`, `designs`/`architectures` data routes and `generate-design`/`generate-prompt-from-kanban` until implemented).
  - **lib/:** Added `agent-runner.ts`, `ideas-md.ts`, `initialization-templates.ts`; corrected `feature-to-markdown` to existing `architecture-to-markdown` (and kept `design-to-markdown`, `design-config-to-html`).
  - **API section:** Generate and data endpoint lists updated to match implemented routes only; external data sources (OpenAI) and schema list adjusted accordingly.
  - **Security:** Blockquote warning for env/secrets (Critical) per prompt formatting.
  - **Retry & fallback:** Short retry pattern note (Retry button + `refreshData()` or refetch; optional `AbortController`).
  - **Appendix:** Key files list extended with `agent-runner.ts`.
- **No structural change** to the 13-section layout (Overview, Directory Structure, Data Flow, API Design, Tauri, Components, Types, Error Handling, Performance, Security, Scalability, Anti-Patterns, ADRs) or to architectural style (layered + modular monolith, file-first, dual-backend).

## Consequences

- New contributors and AI tools get an accurate map of routes and lib modules.
- Future route additions (e.g. designs/architectures CRUD, generate-design) should be added to the directory tree and API sections when implemented.
- ADR table in architecture.md remains the summary; detailed ADRs stay in `.cursor/adr/`.

## References

- `.cursor/setup/architecture.md` — Updated architecture document
- Prompt 02: Generate architecture.md (structure and formatting requirements)
- Repo: `src/app/api/**/route.ts`, `src/lib/*.ts`
