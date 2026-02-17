# ADR 0001: Tech stack single source of truth and atomic component structure

## Status

Accepted

## Context

- Projects need a single, explicit source of truth for frontend, backend, and tooling choices so agents and developers stay aligned.
- UI needs a consistent, scalable component hierarchy that prevents duplicate implementations and enforces clear boundaries (e.g. no custom replacements for design-system primitives, clear composition rules).

## Decision

### 1. Tech stack single source of truth

- **Tech stack** is defined in `.cursor/technologies/tech-stack.json`.
- All agents (backend, frontend, solution architect, tester, documentation writer) and documentation must align with this file. No ad-hoc or duplicate stack definitions in agent files.
- This template uses **Next.js API Routes only** (no Express). Stack covers: frontend (framework, styling, state, components, routing, testing, build), backend (runtime, framework, database, ORM, auth, validation, testing), tooling (lint, format, e2e, package manager).

### 2. Atomic component structure

- Component hierarchy under `src/components/` is **strict** and follows atomic design with a dedicated **shared** and **pages** layer:

| Layer       | Purpose | Allowed imports |
|------------|---------|------------------|
| **ui**     | shadcn/ui primitives only; do not modify | — |
| **atoms**  | Customizations of `ui`; single-purpose | `ui` only |
| **shared** | Reusable components (same structure, different data) used in multiple places | atoms, molecules, or organisms (generalized) |
| **molecules** | Composed UI pieces | **atoms** and **shared** only |
| **organisms** | Section-level compositions | **molecules** and **shared** only |
| **pages**  | Page-level compositions | **organisms** and **shared** only |

- **Rules:**
  - **ui:** Add via `npx shadcn@latest add <name>`. Do not edit shadcn source; customize via **atoms**.
  - **atoms:** Thin wrappers or variants over `ui` (e.g. `PrimaryButton`, `FormInput`).
  - **shared:** When a component is reused in several places with the same structure but different data, move or create it in `shared`.
  - **molecules:** Must not import from `ui`, `organisms`, or `pages`.
  - **organisms:** Must not import from `ui`, `atoms`, or `pages`.
  - **pages:** Must not import from `ui`, `atoms`, or `molecules`. Consumed only by `src/app/**/page.tsx`.
- App route files (`src/app/**/page.tsx`) import only from `@/components/pages` or `@/components/shared` when using a shared organism.

## Consequences

- **Consistency:** One place to update stack choices; agents and docs stay in sync.
- **Onboarding:** New contributors and AI agents know exactly which technologies and structure to use.
- **Refactors:** Changing stack or component boundaries is done by updating tech-stack.json and this ADR, then propagating to agents and code.
- **Enforcement:** Cursor rules and agent checklists enforce no reverse or skip-layer imports (molecules → atoms/shared; organisms → molecules/shared; pages → organisms/shared).

## References

- `.cursor/technologies/tech-stack.json` — canonical tech stack
- `.cursor/rules/` (or project rule file) — import and structure rules for components
