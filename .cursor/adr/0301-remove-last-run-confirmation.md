# ADR 0301 — Remove last run: confirmation dialog

## Status

Accepted.

## Context

The Run tab and the command palette both offer **"Remove last run from history"**, which deletes the most recent run entry immediately with no confirmation. **"Clear run history"** already uses a confirmation dialog in both the Command palette and the Run tab (WorkerHistorySection). Removing the last run is a destructive, one-way action; accidental clicks could lose the most recent run output with no way to recover.

## Decision

- **Command palette:** When the user selects "Remove last run from history", open a confirmation dialog instead of removing immediately. Dialog title: "Remove last run from history?" Body: "The most recent run will be removed. This cannot be undone." Actions: Cancel (outline), Remove (destructive). On confirm, call `removeTerminalOutputFromHistory(firstRunId)`, close the dialog, and show the existing success toast. Use new state `removeLastRunConfirmOpen` and a confirm handler `handleConfirmRemoveLastRun`.
- **Run tab (WorkerHistorySection):** When the user clicks the "Remove last run" toolbar button, open a confirmation dialog instead of removing immediately. Same copy and actions as the palette dialog. On confirm, remove by `history[0].id` (the most recent run), close the dialog, and show the existing success toast. Use new state `removeLastRunConfirmOpen` and inline confirm handler.
- No change to the underlying store or to the command palette entry label/shortcut documentation.

## Consequences

- Users are less likely to lose the last run by accident; behaviour is aligned with "Clear run history" and other destructive run-history actions.
- One extra click to confirm when intentionally removing the last run.
- Implementation is local to CommandPalette and ProjectRunTab (WorkerHistorySection); no new lib or Tauri commands.
