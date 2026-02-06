# ADR 073: Work items (tickets) document in .cursor

## Status

Accepted.

## Context

The project needs a single place for suggested work items (tickets) derived from codebase analysis: what is done, what is missing, and prioritized next steps. This supports planning and onboarding and aligns with keeping project documentation under `.cursor/`.

## Decision

- **Location:** Maintain a work-items document at **`.cursor/tickets.md`** in the project root.
- **Content:** The document includes:
  - **What is done:** Summary of implemented features and data/backend behavior (from actual codebase).
  - **What is missing or incomplete:** Gaps (testing, validation, error handling, UX, maintainability, data consistency, etc.).
  - **Prioritized suggested tasks:** List of tickets with title and short description, ordered by priority (P0 critical → P3 lower).
  - **Next steps:** Concrete immediate/short-term/backlog actions.
- **Source of truth:** Content is based on real codebase analysis (structure, APIs, store, pages, existing `.cursor/ANALYSIS.md` and `.cursor/errors.md`), not generic templates.
- **Format:** Clear markdown (sections, tables, bullet lists) for readability and version control.

## Consequences

- Planning and sprint discussions can reference `.cursor/tickets.md` for a shared view of suggested work.
- New contributors and AI assistants can use it to see done vs missing and suggested priorities.
- The document can be updated as the codebase and ADRs evolve; it remains a living artifact.
