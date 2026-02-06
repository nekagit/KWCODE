# ADR 034: Project entity categorization (phase, step, organization, categorizer, other)

## Status

Accepted.

## Context

Users need to categorize all entities in a project (prompts, tickets, features, ideas, designs, architectures) by dimensions such as phases, steps, organizations, a custom categorizer, or other. This supports filtering, grouping, and reporting (e.g. view by phase, by team, by workflow step).

## Decision

- **Data model**
  - Add `EntityCategory`: optional fields `phase`, `step`, `organization`, `categorizer`, `other` (all strings).
  - Add `ProjectEntityCategories`: optional maps per entity type (`prompts`, `tickets`, `features`, `ideas`, `designs`, `architectures`), each keyed by entity id (string) and value `EntityCategory`.
  - Add `project.entityCategories?: ProjectEntityCategories` on `Project`. Categorization is project-scoped (same entity can have different categories in different projects).
- **API**
  - `GET /api/data/projects/[id]`: merge `project.entityCategories` into each resolved entity so responses include `phase`, `step`, `organization`, `categorizer`, `other` on each prompt/ticket/feature/idea/design/architecture.
  - `PUT /api/data/projects/[id]`: accept `entityCategories` in body and persist on project.
- **UI (project detail page)**
  - **Categorization card**: list per entity type (prompts, tickets, features, ideas, designs, architectures); for each entity show five optional text inputs (phase, step, organization, categorizer, other). Changes update local state; **Save links** persists `entityCategories` with the project.
  - **Group by**: dropdown (None, Phase, Step, Organization, Categorizer, Other). When set, entity lists are sorted by the selected field so items with the same value appear together.
  - **Category badges**: on each entity row in the entity cards, show small badges for any set category (e.g. `phase: Discovery`, `organization: Frontend`).
- **ADR**
  - Document in `nenad/adr` and `.cursor/adr`.

## Consequences

- Users can assign phase, step, organization, categorizer, and other to every linked entity and group or sort by these dimensions.
- Categorization lives on the project, so one entity can have different categories in different projects.
- Export-as-JSON already includes the full project object, so `entityCategories` is included in exports.
