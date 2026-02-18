# ADR 0187: Command palette — Copy first project path

## Status

Accepted.

## Context

The app has "Copy data directory path" and "Copy app info" in the command palette; project path can be copied from the Projects list card (ADR 0112) or from the project detail header. Keyboard-first users had no way to copy the first active project's repo path from anywhere without navigating to Projects or a project page. Adding a "Copy first project path" action completes the palette's copy actions and matches the pattern of resolving the first active project (as in "Go to first project", "Open first project in Cursor", etc.).

## Decision

- Add a **"Copy first project path"** action to the command palette (⌘K / Ctrl+K).
- **CommandPalette**: Resolve the first active project the same way as "Go to first project" (`activeProjects[0]`, then find the project in `projects ?? await listProjects()`). When the action is selected: if no active project, show toast "Select a project first" and close; if project not found, show toast "Open a project first" and close; if `project.repoPath` is missing or empty, show toast "No project path set" and close; otherwise call `copyTextToClipboard(project.repoPath)` from `@/lib/copy-to-clipboard`, show toast "Project path copied", and close the palette.
- **keyboard-shortcuts.ts**: Add one entry in the Command palette group: "Copy first project path".
- No new Tauri commands or API routes; reuse existing `listProjects`, run store `activeProjects`, and `copyTextToClipboard`.

## Consequences

- Users can copy the first active project's repo path from the command palette from any page.
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
