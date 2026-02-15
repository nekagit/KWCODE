# ADR 0010: Documentation standards and strategy

## Status

Accepted

## Context

The project needs a single, authoritative guide on how to write, structure, and maintain documentation for both humans and AI agents. Best practice for AI-assisted projects is to maintain a documentation strategy that: (1) defines doc types and hierarchy (README, CONTRIBUTING, ADRs, API ref, guides, runbooks, inline TSDoc), (2) sets style and standards (voice, markdown, code examples, file naming), (3) supports AI agents via `.cursor/setup/` context files and agent instructions, (4) enforces “docs in same PR” and testable examples. Without a canonical `documentation.md`, contributors and agents may use inconsistent formats, miss required sections, or leave public APIs undocumented.

## Decision

- **Use `.cursor/setup/documentation.md`** as the definitive documentation standards and strategy document.
- **Content covers:** Documentation Landscape (current state and gaps), Documentation Philosophy (8 principles including “Test your examples” and “Update docs in the same PR”), Documentation Types & Hierarchy (README, CONTRIBUTING, CHANGELOG, Architecture, ADRs, API ref, Component docs, Guides, Runbooks, Inline TSDoc), Standards & Style Guide, Documentation for AI Agents (context files, agent instructions), Maintenance & Governance, Documentation Testing, Templates, Glossary, and Appendix (checklists, key paths).
- **Project-specific alignment:** README/CONTRIBUTING templates and Appendix key paths reflect this repo: run-prompts, Next.js 16, Tauri (e.g. `script/tauri-with-local-target.mjs`, `script/wait-dev-server.mjs`), Playwright E2E (`test:e2e`, `test:e2e:ui`), and `script/` (scaffold, Tailwind extractors). ADR template includes explicit Status guidance (e.g. Accepted). TSDoc example includes `@throws`, `@example`, and `@see`.
- **Governance:** “Docs-or-it-didn’t-happen” rule; PR checklist for docs; link checking and example validation recommended in CI.

## Consequences

- **Positive:** One place for doc standards; consistent structure and style; AI agents and new contributors share the same expectations; ADRs and setup files stay aligned with best practice.
- **Negative:** Requires discipline to update docs in the same PR and to keep `documentation.md` current when practices change.

## References

- Canonical doc: `.cursor/setup/documentation.md`
- ADRs: `.cursor/adr/` (file naming and template defined in documentation.md)
- Setup context: `.cursor/setup/` (design, architecture, ideas, testing, documentation)
