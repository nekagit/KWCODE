# ADR 126: Sidebar groups — full height and increased spacing

## Status

Accepted.

## Context

Sidebar nav groups (Tools, Work) were tightly stacked with minimal vertical space and gap. Users wanted groups to use the full sidebar height and have more vertical space and gap between groups and items.

## Decision

- **Nav uses full width**
  - Sidebar nav uses `w-full px-2` so content spans the full sidebar width with consistent horizontal padding.

- **Groups fill remaining vertical space**
  - Dashboard stays at the top. The two groups (Testing · Architecture · Data, Projects · Tickets · Features) are wrapped in a `flex flex-col flex-1 min-h-0` container with `gap-4` between them.
  - Each group is `flex-1 min-h-0` so they share the remaining sidebar height equally and grow to fill the space.

- **Increased spacing**
  - Nav: `gap-1` between top-level elements (dashboard and groups wrapper).
  - Between groups: `gap-4` (1rem) and `pt-4` after the separator.
  - Within each group: `gap-1` between section label and items and between items.
  - Link items: `py-2.5` (was `py-2`) for slightly more tap/click area.
  - Section labels: `mb-2` (was `mb-1.5`).

## Consequences

- Sidebar feels less cramped; groups have clear separation and use the full height below the header. No change to behavior or routes.
