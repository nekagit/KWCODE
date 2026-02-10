# ADR 118: Floating action button and Log / Run / Configuration modals

## Status

Accepted.

## Context

Log, Run, and Configuration were previously in the sidebar (Run in main nav; Log in "Log & DB Data"; Configuration in "Settings"). We wanted a single entry point for these secondary actions that keeps the sidebar focused on primary navigation while still allowing quick access.

## Decision

- **Floating action button (FAB)** at bottom-right: a main button that on hover reveals three circular action buttons arranged in a circle (Log, Run, Configuration).
- **Log, Run, and Configuration** are shown as **modals** when opened from the FAB, reusing the same content as the former full pages / tab.
- **Sidebar**: Run is removed from main nav; Log is removed from "Log & DB Data" (Database remains); the entire "Settings" section (Configuration) is removed.
- **Quick actions context**: `QuickActionsProvider` exposes `openLogModal(runId?)`, `openRunModal()`, `openConfigModal()` so that "View log" in the running-terminals popover opens the Log modal (with optional run selection) instead of navigating to `/?tab=log`.
- Routes `/run` and `/configuration` and the dashboard tab `?tab=log` remain available for direct URLs and in-page links; only the sidebar entries were removed.

## Consequences

- Sidebar is simpler; secondary/settings actions are grouped in the FAB.
- Log, Run, and Configuration are one click (after hover) from anywhere.
- "View log" in the running-terminals widget opens the Log modal with the selected run, improving continuity.
- FAB uses a large hit area so hover state persists when moving the cursor to the action circles.
