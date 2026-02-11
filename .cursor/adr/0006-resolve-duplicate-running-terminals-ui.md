---
title: Resolve Duplicate Running Terminals UI
issue: N/A
---

## Context
The UI was displaying a "RUNNING TERMINALS" section twice, leading to a broken layout. Upon investigation, it was found that the `RunningTerminalsPopover` component was being rendered directly in `AppShell.tsx` and also indirectly through `TerminalStatusBadge.tsx`, which `AppShell.tsx` also renders. Additionally, there was a refactoring effort that moved `RunningTerminalsPopover.tsx` from `src/components/organisms/Display/` to `src/components/organisms/`, leaving a modified old file.

## Decision
1. Removed the direct rendering of `RunningTerminalsPopover` from `src/components/app-shell.tsx` to prevent duplicate UI elements. The `RunningTerminalsPopover` will now only be rendered as a child of `TerminalStatusBadge`, which is correctly placed in `AppShell`.
2. Deleted the old file `src/components/organisms/Display/RunningTerminalsPopover.tsx` as it was a remnant of a refactoring and is no longer needed. The correct component is now located at `src/components/organisms/RunningTerminalsPopover.tsx`.

## Status
Completed.

## Consequences
The UI should now correctly display only one "RUNNING TERMINALS" section, resolving the broken layout. The codebase is cleaner with the removal of the redundant file.
