# ADR 0237: Command palette — Download/Copy first project designs and architectures (JSON/Markdown)

## Status

Accepted.

## Context

The project Design and Architecture tabs offer export/copy as JSON and Markdown via existing libs. The command palette had "Go to Design" and "Go to Architecture" but no way to export the first active project's designs or architectures from ⌘K. Keyboard-first users had to open the project and the relevant tab to download or copy.

## Decision

- Add eight command palette actions:
  - **Download first project designs as JSON** / **Copy first project designs as JSON**
  - **Download first project designs as Markdown** / **Copy first project designs as Markdown**
  - **Download first project architectures as JSON** / **Copy first project architectures as JSON**
  - **Download first project architectures as Markdown** / **Copy first project architectures as Markdown**
- Reuse existing libs: `getProjectResolved(id)` from `@/lib/api-projects`; download/copy from `download-project-designs-json`, `download-project-designs-md`, `download-project-architectures-json`, `download-project-architectures-md`.
- Handlers use the same "first project" pattern as "Copy first project implementation log": require at least one active project, resolve project by path via `listProjects()`, then `getProjectResolved(proj.id)`; cast `resolved.designs` / `resolved.architectures` to typed arrays and call the existing download/copy functions.
- Document all eight actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can download or copy the first active project's designs or architectures as JSON or Markdown from ⌘K without opening the project or the Design/Architecture tab.
- Behavior and format match the project Design and Architecture tab exports; single source of truth in existing libs.
