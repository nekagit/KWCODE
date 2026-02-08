# ADR 080: Drag spec files to Tickets / Features cards – link and show in cards

## Status

Accepted.

## Context

Users wanted to drag a file from the Project Spec list and drop it onto the Tickets or Features card so that the file is linked to the project for that category (tickets or features) and shown in the card. This supports associating spec documents (e.g. `.cursor/tickets.md`, `.cursor/features.md`, or feature-specific `.cursor/feature-<id>.md`) with the project’s Tickets and Features sections without only linking entity records.

## Decision

- **Data model**
  - Add optional `specFilesTickets?: string[]` and `specFilesFeatures?: string[]` to the `Project` type. Each is an array of spec file paths (e.g. `.cursor/tickets.md`) linked to the Tickets or Features card.
  - Persist in `projects.json` and via project API PUT/PATCH; Tauri `update_project` passes full project JSON so no Rust change.

- **API**
  - Projects GET returns `specFilesTickets` and `specFilesFeatures` when present. PUT/PATCH accept and validate arrays of strings and merge into the project.

- **Project details page (Todos tab)**
  - **Tickets** accordion: Add a drop zone that accepts `application/x-project-spec-file` drag data. On drop, add the file path to `specFilesTickets` and ensure the file is in `specFiles` if not already. Show linked spec files as badges with remove (X) button. Placeholder text when none: “Drag a file from Project Spec here to link it to this card.”
  - **Features** accordion: Same pattern for `specFilesFeatures`.
  - Reuse existing `SPEC_FILE_DRAG_TYPE` and draggable spec list; new handler `handleSpecFileLinkToCard(target, path, name)` and remove helpers `removeSpecFileFromTickets` / `removeSpecFileFromFeatures`. Drop zones use `dragOverCard` values `tickets-spec` and `features-spec` to avoid clashing with the Setup tab “Features” entity drop target.

- **UX**
  - Visual feedback on drag-over (ring + background) and loading state during save, consistent with existing Design/Architecture drop zones.

## Consequences

- Users can associate tickets/features spec .md files with the project and see them on the Tickets and Features cards in the Todos tab.
- Linked spec files are also in the Project Spec list (added on first link if missing).
- Clear separation from entity linking: Setup tab Features card still links feature entities via `feature-<id>.md`; Todos tab Features card now also shows and accepts any spec file for “spec files linked to this card.”
