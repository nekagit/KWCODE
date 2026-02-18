# ADR 0219: Command palette — Download ideas and Copy ideas (Markdown and JSON)

## Status

Accepted.

## Context

The Ideas page offers "Download as Markdown", "Copy as Markdown", "Download as JSON", and "Copy as JSON" for the My Ideas list. Keyboard-first users had no way to export or copy ideas from the command palette (⌘K) without opening the Ideas page. Other export surfaces (run history, documentation info, app info, keyboard shortcuts) already expose download/copy actions from the palette.

## Decision

- Add four command palette actions: **Download ideas**, **Download ideas as JSON**, **Copy ideas**, **Copy ideas as JSON**.
- Introduce a small lib `src/lib/fetch-ideas.ts` that returns the current ideas list in both modes: Tauri via `get_ideas_list` with no project (global list); browser via `GET /api/data/ideas`. Palette handlers fetch ideas then call the existing export libs (`download-my-ideas-md`, `download-my-ideas`, same as Ideas page).
- Document the four actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy the My Ideas list from ⌘K without navigating to the Ideas page.
- Behavior and file formats match the Ideas page (e.g. `my-ideas-{timestamp}.md`, same JSON/Markdown shape).
- Single place for dual-mode ideas fetch can be reused by other callers (e.g. future CLI or automation).
