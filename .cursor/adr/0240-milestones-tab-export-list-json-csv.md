# ADR 0240: Milestones tab — Export/Copy list as JSON and CSV

## Status

Accepted.

## Context

The Milestones tab allowed users to download or copy only the **selected milestone’s content** as Markdown (via `download-milestone-document`). The Tickets, Design, and Architecture tabs offer export/copy of the **list** (e.g. JSON, CSV). There was no way to export the full milestones list from the Milestones tab.

## Decision

- Add list-level export on the Milestones tab:
  - **Download as JSON** / **Copy as JSON** — payload: `{ exportedAt, count, milestones: MilestoneRecord[] }`; filename `project-milestones-{timestamp}.json`.
  - **Download as CSV** / **Copy as CSV** — columns: id, project_id, name, slug, created_at, updated_at (content omitted for brevity); filename `project-milestones-{timestamp}.csv`.
- New libs: `src/lib/download-project-milestones-json.ts` and `src/lib/download-project-milestones-csv.ts`, following the same patterns as `download-project-tickets-json` and `download-project-tickets-csv` (accept `MilestoneRecord[]`, toasts on empty/success/fail).
- **ProjectMilestonesTab**: Add four buttons (Export JSON, Copy JSON, Export CSV, Copy CSV) in the header row next to "Add milestone", using the existing `milestones` state. No new fetch; tab already loads milestones.

## Consequences

- Users can export or copy the full milestones list as JSON or CSV from the Milestones tab, aligning with other project tabs.
- Command palette was not extended in this change; that can be done later if desired.
