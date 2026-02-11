# 2026-02-11: Project Details – Remove Floating Button with Project Title

## Status

Accepted

## Context

The project details page showed at the top a header block with a back button (to `/projects`) and the project title (name plus optional repo path badge and description). This was perceived as a floating button with the project title and added visual clutter at the top of the page.

## Decision

- **Remove** from the project details page header:
  - The back button (link to `/projects`).
  - The project title block (project name, repo path badge, and description) rendered via `PageHeader`.

- **Keep** in the header:
  - Edit and Delete actions (right-aligned) so users can still edit or delete the project from the details page.

- **Implementation**: `ProjectHeader` (`src/components/molecules/LayoutAndNavigation/ProjectHeader.tsx`) was updated to render only the `ButtonGroup` with Edit and Delete; the left section (back button + `PageHeader`) and unused imports (`Link` for back, `Badge`, `ArrowLeft`, `PageHeader`) were removed. The container uses `justify-end` to align the actions to the right.

## Consequences

- Cleaner top of the project details page; no floating title/back block.
- Users can still navigate back via the sidebar (Projects) or browser back; Edit and Delete remain available in the header.
