# ADR 067: Project details – best practice .cursor structure button

## Status

Accepted.

## Context

When starting a new project, users want to know which files and folders to create under `.cursor` (and related root files like `AGENTS.md`, `README.md`) so the project follows best practices for AI-assisted development. The "Files in .cursor" section lists existing files but does not show what *should* be there.

## Decision

- **Best-practice data**
  - Add `src/lib/cursor-best-practice.ts` exporting `CURSOR_BEST_PRACTICE_FILES`: an array of entries with `path` and optional `description`. Paths are file or folder names (e.g. `AGENTS.md`, `.cursor/rules/`, `.cursor/adr/README.md`). For `.md` files, `description` is a short sentence on what should be inside.
  - Include: `AGENTS.md`, `.cursor/AGENTS.md`, `.cursor/rules/`, `.cursor/rules/RULE.md`, `.cursor/adr/`, `.cursor/adr/README.md`, `FEATURES.md`, `README.md` with concise descriptions where applicable.
- **Project details page**
  - In the "Files in .cursor" accordion, add a button: **"Show best practice .cursor structure"** (with `FileText` icon). The button is always visible (with or without repo path).
  - On click, open a dialog titled **"Best practice .cursor structure"** with a short description and a scrollable list: each entry shows the path (monospace) and, for entries with a description, the description in muted text below. Folders have no description.
- **No file creation**
  - The feature is informational only; it does not create files in the project. Users copy or create the structure themselves.

## Consequences

- Users can click one button on the project details page to see the recommended .cursor layout and what to put in each .md file when starting a project.
- Best-practice list is centralized in one module and can be extended later (e.g. more paths or descriptions).
