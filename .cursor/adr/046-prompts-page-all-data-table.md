# ADR 046: Prompts page – table of all prompt data

## Status

Accepted.

## Context

The Prompts page allowed users to create, edit, delete, and select prompts for run, but showed only a compact list (id + title) with checkboxes. There was no single place to see all stored fields (id, title, category, tags, created_at, updated_at, content) at a glance.

## Decision

- **All-data table**
  - Add a second card on the Prompts page titled “All prompts data” with a table that lists every prompt and all its fields.
- **Data source**
  - Table data is loaded via a dedicated fetch to `GET /api/data/prompts` on mount and after any create, edit, delete, or “save as new” from AI generate, so the table always reflects the full list with content, category, tags, and dates.
- **Columns**
  - Select (checkbox, synced with run selection), ID, Title, Category, Tags, Created, Updated, Content (truncated preview), and Actions (Edit, Delete). Category, Tags, Created, and Updated are hidden on smaller breakpoints (sm/md/lg) to keep the table usable on narrow screens.
- **Actions**
  - Edit opens the existing edit dialog with the row’s data pre-filled. Delete uses the existing delete flow with confirmation.

## Consequences

- Users can scan and manage all prompts and their metadata in one table.
- The table stays in sync with create/edit/delete and AI-generated “save as new” by refetching after each mutation.
- Responsive column visibility avoids clutter on small screens while still showing ID, title, content preview, and actions.
