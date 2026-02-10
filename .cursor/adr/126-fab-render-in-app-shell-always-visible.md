# ADR 126: FAB rendered in AppShell and portaled to body for guaranteed visibility

## Status

Accepted.

## Context

The Flutter-style floating action button (FAB) at bottom-right—with a main button that on hover reveals three circles (Log, Run, Configuration)—was implemented in ADR 118 and rendered inside `QuickActionsProvider` as a sibling of the main app content. Users reported not seeing the FAB at all, so the three child actions never appeared.

## Decision

- **Render the FAB inside AppShell** (component `QuickActionsFAB` at the end of the shell layout) so it mounts with the shell.
- **Portal the FAB to `document.body`** via `createPortal(fabContent, document.body)`. The AppShell root uses `overflow-hidden`, which creates a clipping context and can clip fixed-position descendants; portaling to body ensures the FAB is never clipped and is always positioned relative to the viewport.
- **Mount only on client**: render the portal only after `useEffect` runs (`mounted` state) so `document.body` exists and SSR is safe.
- **Raise FAB z-index** to `z-[99999]` so it sits above overlays and other fixed UI.
- **Visibility tweaks**: main FAB uses `ring-2 ring-primary/20`; child action buttons use `border border-border`.

## Consequences

- The FAB is guaranteed visible at viewport bottom-right and not clipped by any ancestor overflow.
- Theme (CSS variables) still applies because the portal is in the same document; body is the themed root.
- Single source of FAB UI remains in `QuickActionsFAB`; modals stay in `QuickActionsProvider`.
