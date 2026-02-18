# ADR 0291 — Command palette: Download/Copy first project tech stack (JSON, Markdown, CSV)

## Status

Accepted.

## Context

- The app already has command palette actions for the **app** tech stack (Technologies page data): "Download tech stack", "Copy tech stack", and variants for JSON, Markdown, and CSV. These operate on `.cursor/technologies/tech-stack.json` in the app repo.
- There was no way to export the **first active project's** tech stack (that project's `.cursor/technologies/tech-stack.json`) from the command palette. Other "first project" exports exist: tickets, milestones, designs, architectures, implementation log. Aligning first-project tech stack export with these gives a consistent, discoverable capability.

## Decision

- Add six command palette actions: **Download first project tech stack as JSON**, **Copy first project tech stack as JSON**, **Download first project tech stack as Markdown**, **Copy first project tech stack as Markdown**, **Download first project tech stack as CSV**, **Copy first project tech stack as CSV**.
- New lib `src/lib/fetch-tech-stack-for-project.ts`: `fetchTechStackForProject(projectPath: string)` — in Tauri uses `read_file_text_under_root(root, ".cursor/technologies/tech-stack.json")`; in browser shows toast "Available in desktop app" and returns null. Reuse type `TechStackExport` from `@/lib/download-tech-stack`.
- Command palette handlers: resolve first active project path (`activeProjects[0]`), call `fetchTechStackForProject(path)`, then existing download/copy helpers (`downloadTechStack`, `copyTechStackToClipboard`, `downloadTechStackAsMarkdown`, `copyTechStackAsMarkdownToClipboard`, `downloadTechStackAsCsv`, `copyTechStackAsCsvToClipboard`). Empty selection or missing file → toast.
- Keyboard shortcuts help: add the six actions under the Command palette group.

## Consequences

- Users can export the first active project's tech stack as JSON, Markdown, or CSV from ⌘K without opening the Technologies page or that project. Tauri-only (browser shows info toast). Aligns with other first-project exports and existing tech stack formats.
