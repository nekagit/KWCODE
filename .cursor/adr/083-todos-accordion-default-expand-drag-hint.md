# ADR 083: Todos tab – default-expand Features/Tickets accordions and drag hint

## Status

Accepted.

## Context

Drag-and-drop from Project Spec to the Features or Tickets cards is implemented (ADR 071, ADR 080). Users wanted to drag `features.md` (or any spec file) into the Features card and have it linked there. The drop zones were only visible when the Features or Tickets accordion sections were expanded, and the draggable nature of spec files was not called out in the copy.

## Decision

- **Default-expand Features and Tickets on Todos tab**
  - In the Todos tab accordion, set `defaultValue` to include `"todos-features"` and `"todos-tickets"` in addition to `"spec"` and `"cursor-files"`.
  - This keeps the Features and Tickets drop zones visible by default so users can drag from Project Spec and drop without having to expand those sections first.

- **Drag hint in Project Spec**
  - Add to the Project Spec description: “Drag a file to the Features or Tickets cards below to link it to that card.” so users know they can drag to link.

## Consequences

- Dragging a file (e.g. `features.md`) from Project Spec onto the Features card and dropping automatically links it (adds path to `specFilesFeatures`), with the drop zone visible by default.
- Same for Tickets card and `specFilesTickets`.
- No API or data model changes; UX only.
