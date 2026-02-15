# ADR 0001: How to use Architecture Decision Records (ADRs)

## Status

Accepted (template)

## Context

This project uses Architecture Decision Records (ADRs) to document significant technical and architectural decisions. Each ADR captures the context, decision, and consequences in one place so future readers (and AI) understand why things are the way they are.

## Decision

- **Location:** Store ADRs in `.cursor/adr/` as markdown files.
- **Naming:** Use a number prefix and a short slug, e.g. `0001-how-to-use-adrs.md`, `0002-api-design.md`.
- **Format:** Each ADR should include:
  - **Title** — Short descriptive title
  - **Status** — Proposed | Accepted | Deprecated | Superseded
  - **Context** — What situation or problem led to this decision
  - **Decision** — What was decided
  - **Consequences** — Positive and negative outcomes, follow-up work
  - **References** — Links to related ADRs, docs, or code

## Consequences

- New team members and AI assistants can quickly understand past decisions.
- Changing a decision later is done by adding a new ADR that supersedes or deprecates the old one; do not delete or rewrite old ADRs.

## References

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (Michael Nygard)
