# ADR 032: Template project seed (10 prompts, 100 tickets, 100 features, 1 idea, 1 design, 1 architecture)

## Status

Accepted.

## Context

Users need a way to quickly populate the app with sample data for demos, testing, or onboarding. A single “template project” should include a representative set of linked entities: recurring prompts, many tickets and features, one idea, one complete design, and one complete architecture.

## Decision

- **Seed API**
  - Add `POST /api/data/seed-template` that creates and appends to existing JSON data:
    - **10 recurring prompts**: template category, titles (Sprint planning, Code review checklist, Bug triage, Refactor module, Add tests, Update docs, Deploy staging, Security scan, Performance audit, User feedback review); shared short content about following project patterns.
    - **100 tickets**: UUIDs, titles “Task 1”–“Task 100”, statuses rotated (backlog, in_progress, done, blocked), optional description and priority.
    - **100 features**: UUIDs, titles “Feature 1”–“Feature 100”; each links to one ticket (same index) and one prompt (index % 10); `project_paths` empty.
    - **1 idea**: template idea (e.g. “Template project idea”), category webapp, source template.
    - **1 complete design**: full `DesignConfig` (landing template, colors, typography, layout, sections: hero, features, cta, footer); `DesignRecord` with id, name, config, timestamps.
    - **1 complete architecture**: full `ArchitectureRecord` (e.g. “Clean Architecture (template)”), category clean, with description, practices, scenarios, references, anti_patterns, examples.
    - **1 project**: links to all of the above (promptIds, ticketIds, featureIds, ideaIds, designIds, architectureIds).
  - All new entities use next available IDs (numeric for prompts/ideas, UUID for tickets, features, design, architecture, project). Existing data is preserved; new data is appended.
- **UI**
  - On Projects page: add **Seed template project** button (outline, with Sparkles icon). On click: POST to seed API, then refetch projects. Same button in empty state.
- **ADR**
  - Document in `nenad/adr` and `.cursor/adr`.

## Consequences

- One-click creation of a fully linked template project for demos and testing.
- Seed is additive; safe to run multiple times (each run adds another template project and its entities).
- Recurring prompts are reusable; tickets/features give a realistic volume (100 each).
