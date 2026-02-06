# ADR 064: Project details page – accordion section order

## Status

Accepted.

## Context

The project details page accordions (from ADR 051 and later additions) had "Link to this project" at the top and "Files in .cursor" near the bottom. For better workflow, users wanted the most contextual content first (files in the repo's `.cursor` folder) and the linking/editing action last.

## Decision

- **Section order (top to bottom)**
  1. **Files in .cursor** – list of files in the project's `.cursor` folder (Tauri); default open via `defaultValue={["cursor-files"]}`.
  2. **Designs** – linked designs list and link to Design page.
  3. **Architecture** – linked architecture definitions and link to Architecture page.
  4. **Project spec** (if present) – spec files from `.cursor`.
  5. **Prompts** – linked prompts.
  6. **Tickets** – linked tickets.
  7. **Features** – linked features.
  8. **Ideas** – linked ideas.
  9. **Categorization** – phase/step/organization/categorizer/other per entity.
  10. **Link to this project** – checkboxes to link entities and "Save links"; styled with `bg-primary/5 border-primary/30`.
- **Copy**
  - Designs/Architecture empty-state text: "Use 'Link to this project' **below**" (was "above").
  - Project spec: "Add files from the 'Files in .cursor' section **above**" (was "below").

## Consequences

- Files in `.cursor` are visible first; Link to this project is at the bottom as the main editing action.
- Order matches the requested flow: cursor files → designs & architecture → tickets & features → prompts & categorization → link.
- No change to data or APIs; only layout and copy.
