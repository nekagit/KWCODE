# ADR 0159: Technologies page — filter tech stack by name or value

## Status

Accepted.

## Context

The Technologies page shows the tech stack (Frontend, Backend, Tooling) as badges from `tech-stack.json` but had no way to narrow the list. With many entries, finding a specific technology (e.g. "React" or "Framework") required scanning all badges. A text filter improves discoverability and matches the pattern used on Projects, Prompts, and Ideas pages.

## Decision

- **TechnologiesPageContent.tsx**: Add a filter input in the Tech stack section header (Search icon, placeholder "Filter by name or value…"). Filter is client-side only; no API or persistence.
- **Filter logic**: For each category (frontend, backend, tooling), show only entries whose label (key) or value contains the query (case-insensitive). Empty query shows all entries. Categories with no matches render no card (existing `renderCategoryCard` returns null for empty entries).
- **UI**: Filter input, optional "Clear" button when query is non-empty, and "Showing X of Y" count when filtered. When all categories have no matches, show a single message: "No tech stack entries match \"…\"."
- **Implementation**: New helper `filterTechStackEntries(entries, query)`; local state `techStackFilterQuery`; `useMemo` to compute filtered frontend/backend/tooling and badge counts. Reuse `Input` and Search icon pattern from other pages.

## Consequences

- Users can quickly find technologies by typing part of the name or value.
- Filter is session-only (not persisted), keeping the feature simple and consistent with a minimal touch list.
- Layout remains the same; when filtered, one or more category cards may disappear; empty state message appears when nothing matches.
