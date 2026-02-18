# ADR 0004: Ideas page spacing and toolbar UI

## Status

Accepted. Implemented 2025-02-18.

## Context

The Ideas page had cramped spacing and a single long toolbar row mixing filter/sort controls with export and folder actions, making the UI hard to scan and use.

## Decision

- **Page layout**
  - Wrapped the Ideas page in a single container: `container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12` so breadcrumb, toolbar, and tab content share consistent width and vertical rhythm.

- **ThreeTabResourcePageContent**
  - Added optional prop `embedded?: boolean`. When `true`, the component uses a minimal wrapper (`space-y-8 pb-12 animate-fade-in`) instead of the full container/padding, so the parent can provide one container and avoid double padding. Ideas page passes `embedded`.

- **Toolbar**
  - Split into two logical sections with a border separator:
    1. **Filter & sort**: search input, sort select, Clear, Reset filters, and result count (e.g. “Showing X of Y ideas”) in one row with `gap-3 sm:gap-4`.
    2. **Actions**: Export group (Export JSON, Export MD, Export CSV) and folder group (Copy path, Open folder, Refresh) in a second row with `border-t border-border/50 pt-4` and `gap-3` between groups.
  - Increased control heights from `h-8` to `h-9` and gaps from `gap-2` to `gap-3`/`gap-4` for better touch and clarity.
  - Export and folder action labels are hidden on small screens (`hidden sm:inline`) to reduce clutter; icons remain visible.

## Consequences

- Ideas page has consistent max-width and padding with the rest of the app and clearer visual hierarchy.
- Toolbar is easier to scan and use; export and folder actions are grouped and spaced.
- `ThreeTabResourcePageContent` remains backward-compatible (default `embedded = false`); only Ideas uses `embedded` today.
