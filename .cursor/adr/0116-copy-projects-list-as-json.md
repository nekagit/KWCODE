# ADR 0116 — Projects list: Copy as JSON to clipboard

## Status

Accepted.

## Context

The Projects list page exposes export actions for the current (filtered/sorted) list: "Download as JSON" and "Download as CSV" (ADR 0109). Adding a clipboard JSON option lets users paste the same data into scripts, support tools, or other apps without creating a file, matching the pattern used on Configuration (Copy app info as JSON) and other pages.

## Decision

- In **`src/lib/download-projects-list-json.ts`**:
  - Extract a shared payload builder used by both download and copy (payload: `{ exportedAt, count, projects }`).
  - Add async **`copyProjectsListAsJsonToClipboard(projects: Project[])`** that builds the same payload, copies pretty-printed JSON via `copyTextToClipboard`, and shows success or "No projects to export" / "Failed to copy" toast.
- In **ProjectsListPageContent**, in the Export row next to the "JSON" download button, add a **Copy as JSON** button (Copy icon) that calls `copyProjectsListAsJsonToClipboard(displayList)` so the copied list respects current filter and sort.

## Consequences

- Users can copy the projects list as JSON to the clipboard from the Projects page without downloading a file.
- Same payload shape as "Download as JSON"; only the delivery (clipboard vs file) differs.
- Aligns with existing copy-as-JSON patterns (e.g. Configuration app info).
