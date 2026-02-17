# ADR 0080: History section — store and display agent terminal outputs

## Status

Accepted

## Context

Users need a way to review past agent runs: which commands ran, when they finished, and their full stdout. Previously only live terminal slots and optional "Archive" (Implement All logs) were available; there was no unified history of all terminal outputs.

## Decision

- **Store**: Add `terminalOutputHistory` to the run store: an array of `TerminalOutputHistoryEntry` (id, runId, label, output, timestamp, exitCode?, slot?). Cap at 100 entries (newest first). Actions: `addTerminalOutputToHistory`, `clearTerminalOutputHistory`.
- **Hydration**: On Tauri `script-exited`, append the completed run’s `logLines` (joined) to history via `addTerminalOutputToHistory`. Applied to every run (Implement All, Setup, temp ticket, npm script, etc.).
- **UI**: New "History" section in the Run tab (Worker), below the terminal slots and ticket queue. Table columns: Time, Label, Slot, Exit code, Output (preview), and a "Full" action to open a dialog with the complete output. "Clear history" button when list is non-empty.

## Consequences

- All completed agent terminal runs are visible in one table; users can inspect exit codes and full logs without re-running. History is in-memory only (cleared on app restart). References: `src/types/run.ts`, `src/store/run-store.ts`, `src/store/run-store-hydration.tsx`, `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` (WorkerHistorySection).
