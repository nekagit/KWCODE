# ADR 0222: Command palette — Download tech stack and Copy tech stack (Markdown and JSON)

## Status

Accepted.

## Context

The Technologies page offers download and copy for the tech stack (Markdown and JSON). Keyboard-first users had no way to export or copy the tech stack from the command palette (⌘K) without opening the Technologies page. Other export surfaces (ideas, prompts, documentation info, run history) already expose download/copy actions from the palette.

## Decision

- Add four command palette actions: **Download tech stack**, **Download tech stack as JSON**, **Copy tech stack**, **Copy tech stack as JSON**.
- Introduce a small lib `src/lib/fetch-tech-stack.ts` that returns the current tech stack in both modes: Tauri via `read_file_text` for `.cursor/technologies/tech-stack.json`; browser via `GET /api/data/technologies` and `files["tech-stack.json"]`. Palette handlers fetch the tech stack then call the existing export libs (`download-tech-stack`, `copy-tech-stack`, same as Technologies page).
- Document the four actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy the tech stack from ⌘K without navigating to the Technologies page.
- Behavior and file formats match the Technologies page (e.g. `tech-stack-{timestamp}.md`, same JSON/Markdown shape).
- Single place for dual-mode tech stack fetch can be reused by other callers (e.g. future automation).
