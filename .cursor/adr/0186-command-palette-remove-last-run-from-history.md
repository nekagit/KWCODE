# ADR 0186: Command palette — Remove last run from history

## Status

Accepted.

## Context

The app has "Clear run history" in the command palette (removes all runs) and a per-run "Remove" button on the project Run tab. Keyboard-first users had no way to remove only the most recent run without opening the Run tab and using the mouse. Adding a single action to remove the latest run from history completes the palette’s run-history controls and keeps the pattern of doing run-history actions from anywhere.

## Decision

- Add a **"Remove last run from history"** action to the command palette (⌘K / Ctrl+K).
- **CommandPalette**: Read the first run id from the run store (`terminalOutputHistory[0]?.id`; history is newest first). Add a handler that, when the action is selected: if a first run id exists, call `removeTerminalOutputFromHistory(id)`, show toast "Last run removed from history", and close the palette; otherwise show toast "No runs in history".
- **keyboard-shortcuts.ts**: Add one entry in the Command palette group describing "Remove last run from history".
- No new Tauri commands or API routes; reuse existing run store API.

## Consequences

- Users can remove only the most recent run from run history from the command palette without opening the Run tab.
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
