# ADR 0171: Project tab — sync URL hash when accordion section changes

## Status

Accepted.

## Context

The Project tab accordion already syncs *from* the URL hash (ADR 0170): when the user navigates to `/projects/{id}?tab=project#design` or `#architecture` (e.g. via "Go to Design" / "Go to Architecture" from the command palette), the correct accordion section opens. When the user expanded a section by *clicking* (Run, Project Files, Design, Architecture, ADR, Agents, Rules), the URL was not updated, so the current view was not reflected in the address bar and links could not be shared with the correct section open.

## Decision

- **ProjectProjectTab.tsx**: When the open accordion section (`openSection`) changes (user expands or collapses a section), update the URL hash to match. Use `history.replaceState` so the current pathname and search params are preserved and the hash is set to the section value (e.g. `#design`, `#architecture`). When the section is `"run"`, set the hash to empty so the default URL stays clean (`?tab=project`). Implement this in a `useEffect` that depends on `openSection`. No new history entry is pushed on each expand/collapse. The existing `hashchange` listener and sync-from-hash logic remain; when we replaceState with a new hash, hashchange may fire and call `setOpenSection` with the same value, which is a no-op and does not cause a loop.

## Consequences

- The URL always reflects the currently open accordion section; users can copy or share the link and others will see the same section open.
- No extra history entries when expanding/collapsing sections (replaceState is used).
- Default "Run" section keeps a clean URL without `#run`.
- Frontend-only; no backend or new routes.
