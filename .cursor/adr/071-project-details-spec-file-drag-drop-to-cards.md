# ADR 071: Project details – Drag and drop spec files to entity cards

## Status

Accepted.

## Context

On the project details page, the Project Spec card lists files (e.g. from the project’s `.cursor` folder or exported from Design/Architecture/Features). Users wanted to drag a spec file from the Project Spec list and drop it onto another card below (e.g. drag `design.md` to the Designs card) to link or create that entity for the project.

## Decision

- **Draggable spec files**
  - Each file in the Project Spec list is draggable (`draggable`, `cursor-grab` / `active:cursor-grabbing`).
  - On `dragStart`, set `application/x-project-spec-file` with JSON `{ path, name }` so drop targets can identify the file.

- **Drop targets**
  - **Designs** card: Accept drops. If path matches `design-<uuid>.md`, link that design to the project (add to `designIds`). Otherwise create a new design with name from the file (e.g. `design` from `design.md`) using default landing config, then link it.
  - **Architecture** card: Same pattern—link by `architecture-<uuid>.md` or create a new architecture with name from filename and link.
  - **Features** card: Only link existing feature: path must match `feature-<uuid>.md`; if so, add that feature to the project. Otherwise show an info toast that only `feature-<id>.md` files can be linked here.

- **UX**
  - Drop zones wrap the content of each card (Designs, Architectures, Features). On `dragOver`, `preventDefault` and set `dropEffect = "copy"`; show visual feedback with `ring-2 ring-primary bg-primary/5` when `dragOverCard` matches. On `dragLeave` / `onDrop`, clear the highlight.
  - While a drop is being processed (`specDropLoading`), drop zones are `pointer-events-none` and slightly dimmed.
  - Success and error toasts (sonner) for create/link results.

## Consequences

- Users can drag any Project Spec file to the Designs or Architecture card to create and link a new entity (or link an existing one when the path matches the export pattern). Features card only supports linking via `feature-<id>.md`.
- No new API endpoints; existing POST for designs and architectures and project update are used.
- Helper text on empty Designs/Architecture/Features cards updated to mention dragging spec files.
