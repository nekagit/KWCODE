# ADR 0011: Architecture.md full regeneration (Prompt 02)

## Status

Accepted

## Context

`.cursor/setup/architecture.md` had been replaced by a terminal summary (Implement All slot output) instead of the actual architecture document. The project needed a single source of truth for structure, data flow, integrations, and technical decisions, aligned with the standard "Prompt 02: Generate architecture.md" specification.

## Decision

- **Regenerate `.cursor/setup/architecture.md`** from scratch using:
  - Current project data: repo layout, tech stack (`.cursor/technologies/tech-stack.json`), `package.json`, `next.config.mjs`, `tsconfig.json`.
  - Actual codebase: `src/app` (pages and API routes), `src/components` (ui, atoms, molecules, organisms, shared), `src/lib`, `src/store`, `src/context`, `src/types`, `src-tauri` (commands, capabilities).
- **Structure:** Architecture Analysis at top; 13 required sections (Overview, Directory Structure, Data Flow, API Design, Tauri, Components, Types, Error Handling, Performance, Security, Scalability, Anti-Patterns, ADRs); Appendix with Common Patterns Cheat Sheet, Import Path Aliases, Key Files.
- **Content:** Exhaustive, specific, and opinionated; references actual routes, lib modules, Tauri commands, and conventions. No duplicate API route entries; Appendix subsection named "Common Patterns Cheat Sheet".

## Consequences

- Architecture doc is again the definitive reference for onboarding and AI-assisted development.
- Future changes (new routes, lib modules, Tauri commands) should be reflected in architecture.md and, when significant, in a new ADR.

## References

- `.cursor/setup/architecture.md` — Regenerated architecture document
- Prompt 02: Generate architecture.md (full specification)
- ADR 0008: Architecture document sync and Prompt 02 alignment
