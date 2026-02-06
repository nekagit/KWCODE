# ADR 033: AI and Cursor files index

## Status

Accepted.

## Context

The project uses `.cursor/adr/` for Architecture Decision Records and `nenad/adr/` for the same ADRs (per project rules: .cursor for Cursor context, nenad for all .md). There was no single index of all AI-related files (ADR, PDR, .cursor layout, agent instructions), making it hard to discover and keep them in sync.

## Decision

- **Index file**: Add **`nenad/ai-project-files.md`** as the single index of:
  - All ADR files (in both `nenad/adr/` and `.cursor/adr/`)
  - PDR location and purpose (`nenad/pdr/`)
  - .cursor directory layout (adr mirror, optional rules)
  - Other AI-related assets (e.g. `nenad/february-repos-overview.json`, data/)
- **PDR folder**: Add **`nenad/pdr/`** with a README for Project Decision Records (project/scope/product decisions), distinct from ADRs (technical/architecture).
- **Agent instructions**: Add **`AGENTS.md`** at repo root with brief instructions for AI agents, pointing to `nenad/` and `.cursor/` and this index.
- **Convention**: When adding new ADRs, update `nenad/ai-project-files.md` and keep `.cursor/adr/` in sync with `nenad/adr/`.

## Consequences

- One place to see all AI and Cursor-related files; easier onboarding and automation.
- Clear split: ADR in `nenad/adr` + `.cursor/adr`, PDR in `nenad/pdr`, index and agent doc in `nenad/` and root.
- Aligns with best practice for AI-assisted projects: explicit indexes and agent-facing docs.
