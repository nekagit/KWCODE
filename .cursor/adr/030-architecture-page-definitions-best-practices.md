# ADR 030: Architecture page – definitions and best practices for projects

## Status

Accepted.

## Context

Projects benefit from explicit architecture and best-practice definitions (DDD, TDD, DRY, SOLID, Clean Architecture, CQRS, etc.) and scenario-specific guidelines. Users need a single place to select from templates or generate with AI, then edit and add more inputs—not create from scratch.

## Decision

- **Architecture page** at `/architecture`:
  - **Templates tab**: Pre-defined architecture templates (DDD, TDD, DRY, SOLID, Clean, Hexagonal, CQRS, BDD, KISS, YAGNI, REST, GraphQL, Microservices, Event Sourcing, Scenario). User selects a template and “Add to my definitions” (no create-from-blank).
  - **AI generated tab**: User enters a topic/scenario and count; AI returns 1–5 architecture definitions; user can add each to “My definitions”.
  - **My definitions tab**: List of definitions added from templates or AI. Filter by category. Edit (all fields + extra inputs), view detail, delete.
  - **Edit**: Name, category, description, practices, scenarios; optional **references**, **anti_patterns**, **examples**; and **Additional inputs** (custom key-value pairs via “Add input”). Data stored in `data/architectures.json`.
- **Templates**: `src/data/architecture-templates.ts` – `ARCHITECTURE_TEMPLATES` (name, category, description, practices, scenarios).
- **API**:
  - `GET /api/data/architectures` – list all.
  - `POST /api/data/architectures` – create (body: name, category, description, practices?, scenarios?, references?, anti_patterns?, examples?, extra_inputs?).
  - `GET /api/data/architectures/[id]` – get one.
  - `PATCH /api/data/architectures/[id]` – update (same fields + extra_inputs).
  - `DELETE /api/data/architectures/[id]` – delete.
  - `POST /api/generate-architectures` – AI generate (body: topic, count); returns `{ architectures: [...] }`.
- **Navigation**: “Architecture” in main sidebar (icon: Building2), between Design and AI Generate.
- **Types**: `src/types/architecture.ts` – `ArchitectureCategory`, `ArchitectureRecord` (with optional references, anti_patterns, examples, extra_inputs), `ArchitectureTemplate`.

## Consequences

- Users cannot create architectures from scratch; they select templates or generate with AI, then edit and add more inputs.
- Definitions can include references, anti-patterns, examples, and custom key-value inputs.
- Definitions can later be linked to projects or referenced in prompts/tickets (future work).
