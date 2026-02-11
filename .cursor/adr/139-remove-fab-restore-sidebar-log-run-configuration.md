# ADR 139: Remove FAB and restore Log, Run, Configuration at bottom of sidebar

## Status

Accepted.

## Context

ADR 118 introduced a floating action button (FAB) at bottom-right that on hover revealed Log, Run, and Configuration as modals, and removed those entries from the sidebar. The user requested to remove the FAB and bring back at the bottom of the sidebar: the Configuration page, the Run page, and the third one (Log).

## Decision

- **Remove the FAB**: `QuickActionsFAB` is no longer rendered in `AppShell`. The import and usage of `QuickActionsFAB` and `useQuickActions` are removed from `app-shell.tsx`.
- **Restore bottom section in sidebar**: A new section is added at the bottom of `SidebarNavigation` (above the sidebar collapse toggle) with:
  1. **Log** — Opens the existing Log modal via `openLogModal()` from `QuickActionsProvider` (no dedicated page; same behavior as FAB “Log”).
  2. **Run** — Link to `/run` (Run page).
  3. **Configuration** — Link to `/configuration` (Configuration page).
- **Section label**: When the sidebar is expanded, the section shows the heading “Log · Run · Configuration”.
- **Log as button**: Log is rendered as a button that calls `openLogModal()`; Run and Configuration remain `NavLinkItem` links. Styling matches the rest of the sidebar (icons: ScrollText, Play, Settings).

## Consequences

- No floating UI; navigation for Log, Run, and Configuration is back in the sidebar.
- Quick actions context and modals (Log, Run, Configuration) are unchanged; only the entry point moves from FAB to sidebar.
- Sidebar bottom section is always visible and consistent with other nav groups (border-t, optional label when expanded).
