# ADR 0232: Command palette — Download ideas as CSV and Copy ideas as CSV

## Status

Accepted.

## Context

The Ideas page offers "Export CSV" and "Copy as CSV" for the My Ideas list (via `download-my-ideas-csv`). The command palette already had Download/Copy ideas as Markdown and JSON (ADR 0219) but no CSV actions. Keyboard-first users could not export or copy ideas as CSV from ⌘K without opening the Ideas page.

## Decision

- Add two command palette actions: **Download ideas as CSV**, **Copy ideas as CSV**.
- Handlers use existing `fetchIdeas()` (same as other ideas palette actions) then call `downloadMyIdeasAsCsv(ideas)` and `copyMyIdeasAsCsvToClipboard(ideas)` from `@/lib/download-my-ideas-csv`. Same toasts and empty-list handling as the Ideas page.
- Document the two actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy the My Ideas list as CSV from ⌘K without navigating to the Ideas page.
- Behavior and CSV format match the Ideas page (columns: id, title, description, category, source, created_at, updated_at).
- No new lib; reuses existing fetch and export modules.
