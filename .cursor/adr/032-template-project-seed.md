# ADR 032: Template project seed (10 prompts, categorized multiphased tickets, major features, 1 idea, 1 design, 1 architecture)

## Status

Accepted.

## Context

Users need a way to quickly populate the app with sample data for demos, testing, or onboarding. A single “template project” should include a representative set of linked entities: recurring prompts, **categorized** and **multiphased** tickets, **major features** (for one idea, one design, one architecture), one idea, one complete design, and one complete architecture.

## Decision

- **Seed API**
  - Add `POST /api/data/seed-template` that creates and appends to existing JSON data:
    - **10 recurring prompts**: template category, titles (Sprint planning, Code review checklist, Bug triage, Refactor module, Add tests, Update docs, Deploy staging, Security scan, Performance audit, User feedback review); shared short content about following project patterns.
    - **Categorized multiphased tickets**: 30 tickets (6 per phase); phases Discovery, Design, Build, Launch, Review; each ticket has phase, step, and categorizer (backlog, task, spike, bug, review) in project `entityCategories`; titles and descriptions reflect phase and categorizer.
    - **Major features (12)**: one feature per product area (e.g. User authentication & authorization, Landing page & marketing, Core API & data layer, …); each feature links 2–3 tickets and one prompt; all support the single idea, design, and architecture.
    - **1 idea**: template idea (e.g. “Template project idea”), category webapp, source template.
    - **1 complete design**: full `DesignConfig` (landing template, colors, typography, layout, sections: hero, features, cta, footer); `DesignRecord` with id, name, config, timestamps.
    - **1 complete architecture**: full `ArchitectureRecord` (e.g. “Clean Architecture (template)”), category clean, with description, practices, scenarios, references, anti_patterns, examples.
    - **1 project**: links to all of the above (promptIds, ticketIds, featureIds, ideaIds, designIds, architectureIds) and `entityCategories` for prompts, tickets, features, ideas, designs, architectures.
  - All new entities use next available IDs (numeric for prompts/ideas, UUID for tickets, features, design, architecture, project). Existing data is preserved; new data is appended.
- **UI**
  - On Projects page: add **Seed template project** button (outline, with Sparkles icon). On click: POST to seed API, then refetch projects. Same button in empty state.
- **ADR**
  - Document in `nenad/adr` and `.cursor/adr`. See ADR 043 for the change to categorized/multiphased tickets and major features.

## Consequences

- One-click creation of a fully linked template project for demos and testing.
- Seed is additive; safe to run multiple times (each run adds another template project and its entities).
- Recurring prompts are reusable; tickets are multiphased and categorized; major features align with 1 idea, 1 design, 1 architecture for clearer demos and grouping.
