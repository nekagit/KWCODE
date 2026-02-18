# ADR 0160: Technologies page — Filter tech stack by name or value

## Status

Accepted.

## Context

The Technologies page shows Frontend, Backend, and Tooling badges from tech-stack.json but had no way to narrow the list. Users could not quickly find a specific technology (e.g. "React" or "Framework") when the stack had many entries.

## Decision

- **TechnologiesPageContent.tsx**: Add local state `techStackFilterQuery` and a filter input in the Tech stack section (Search icon, placeholder "Filter by name or value…"). Filter each category (frontend, backend, tooling) by reducing entries to those where the label (key) or value contains the query (case-insensitive). When a category has no matches after filtering, show the category card with "No matches". When all categories have no matches, show a single message: "No badges match \"…\"." Optional: Clear button when query is non-empty, and "Showing X of Y" count when filtering.
- **Filter helper**: `filterTechStackEntries(entries, query)` returns a subset of the record where `key.toLowerCase().includes(q)` or `value.toLowerCase().includes(q)` (q = query.trim().toLowerCase()).
- **renderCategoryCard**: Support optional third argument `options?: { emptyMessage?: string }` so that when a category has no entries after filter, the card can display "No matches" instead of being hidden.

## Consequences

- Users can type in the filter to show only badges whose label or value matches the query.
- Categories with no matches show a card with "No matches"; when nothing matches at all, a single empty-state message is shown.
- Clear button and "Showing X of Y" improve discoverability and feedback. Filter is client-side only; no persistence (session-only).
