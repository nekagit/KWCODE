# ADR 0146: Command palette — Clear run history

## Status

Accepted.

## Context

Terminal run history (completed agent run outputs) can be cleared from the project detail Run tab via a "Clear history" button and confirmation dialog. There was no way to clear run history from the global Command palette (⌘K / Ctrl+K). Power users who rely on the palette for Refresh data, Go to Run, and other actions had to open a project's Run tab to clear history.

## Decision

- **Command palette**: Add a "Clear run history" action to the palette's action entries. When selected, it calls the run store's `clearTerminalOutputHistory()`, shows a success toast ("Run history cleared"), and closes the palette. Uses the Trash2 icon for consistency with the Run tab's Clear history button.
- No confirmation dialog in the palette (same as other destructive-ish actions like "Print current page"); the Run tab still offers the confirmation flow for users who clear from there.

## Consequences

- Users can clear all terminal output history from anywhere via ⌘K → "Clear run history", without opening a project or the Run tab.
- Aligns the palette with other run-related actions (Go to Run, Refresh data).
- Single source of truth remains the run store; clearing from the palette has the same effect as clearing from the Run tab.
