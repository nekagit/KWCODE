# ADR 036: Delete any entity

## Status

Accepted.

## Context

Users need to remove entities (ideas, prompts, projects, designs, architectures) from the app. Some entities already had DELETE API and UI (architectures, designs, projects); ideas and prompts had no per-entity DELETE route or delete action in the UI.

## Decision

- **API**
  - Add `GET` and `DELETE` for ideas: `src/app/api/data/ideas/[id]/route.ts`. Id is numeric, passed as URL segment; validate and match by `Number(id)`.
  - Add `GET` and `DELETE` for prompts: `src/app/api/data/prompts/[id]/route.ts`. Same pattern as ideas.
  - Architectures, designs, and projects already had `DELETE` at `[id]/route.ts`.
- **UI**
  - **Ideas (My ideas)**: Add `handleDelete(ideaId)` and a Trash2 button per idea; confirm then `DELETE /api/data/ideas/:id`, reload list, toast.
  - **Prompts**: Add `handleDelete(promptId)` and a Trash2 button per prompt; confirm then `DELETE /api/data/prompts/:id`, refresh data and selection, toast.
  - **Projects**: Add delete button on each project card (e.g. on hover); confirm then `DELETE /api/data/projects/:id`, refetch. Use `stopPropagation` so delete does not navigate.
  - **Designs**: Design page had no list of saved designs. Add a **Library** tab that loads `GET /api/data/designs`, lists saved designs with a delete button per row; confirm then `DELETE /api/data/designs/:id`, reload library, toast. After saving to library, refresh the library list.
- **ADR**
  - Document in `nenad/adr/` and mirror in `.cursor/adr/`.

## Consequences

- Users can delete any entity (ideas, prompts, projects, designs, architectures) from the corresponding list or library UI.
- Ideas and prompts now have a consistent [id] API (GET + DELETE) alongside existing list POST.
- Design page gains a visible “Library” of saved designs with delete, making design entities manageable like the others.
