# ADR 032: Project link architecture

## Status

Accepted.

## Context

Projects already link prompts, tickets, features, ideas, and designs. Architecture definitions live on the Architecture page and are stored in `data/architectures.json`. Users need to associate architecture definitions with projects so that each project can reference which patterns and best practices apply (DDD, TDD, Clean Architecture, etc.).

## Decision

- **Project type** (`src/types/project.ts`): Add optional `architectureIds?: string[]` (IDs of architecture records), same pattern as `designIds`.
- **Projects API**:
  - **GET `/api/data/projects/[id]`**: Resolve `architectureIds` by reading `architectures.json` and attaching an `architectures: { id, name }[]` array to the response (like designs).
  - **PUT `/api/data/projects/[id]`**: Accept `architectureIds` in the body and persist.
  - **POST `/api/data/projects`**: Accept optional `architectureIds` when creating a project.
- **Project detail page** (`/projects/[id]`):
  - In "Link to this project", add an **Architecture** column (Building2 icon) with checkboxes for all architectures; save via existing "Save links" including `architectureIds`.
  - Add an **Architecture** card (same row as Designs) listing linked architectures and a link to the Architecture page.
- **Edit project page** (`/projects/[id]/edit`): Add Architecture column to the link section; load architectures from `/api/data/architectures`, persist `architectureIds` on save.

## Consequences

- Projects can reference multiple architecture definitions; linking is optional and backward compatible (existing projects have no `architectureIds`).
- Architecture linking UX matches designs: link from project detail or edit page, with a summary card and link to the Architecture page.
