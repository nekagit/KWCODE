# ADR 066: Project spec – export Design/Architecture/Features as .md, download all to .cursor

## Status

Accepted.

## Context

On the project details page, users need to export linked Design, Architecture, and Features into markdown files and add them to the Project Spec (like adding files from "Files in .cursor" with + Add). From the Project Spec, users should be able to write all those files back to the project's `.cursor` folder with a single action.

## Decision

- **Spec files with content**: Extend `specFiles` to support optional `content?: string`. Entries can be (1) from .cursor: `{ name, path }` only, or (2) exported: `{ name, path, content }` with path e.g. `.cursor/design-{id}.md`.
- **Design card**: Each linked design has a "+ Add" button. On click: fetch full design via `GET /api/data/designs/[id]`, build markdown with `designRecordToMarkdown`, add to Project Spec with path `.cursor/design-{id}.md` and the generated content. Button shows "Added" when that path is already in spec.
- **Architecture card**: Same pattern: "+ Add" per linked architecture, fetch `GET /api/data/architectures/[id]`, `architectureRecordToMarkdown`, add `.cursor/architecture-{id}.md` to spec.
- **Features card**: Same pattern: "+ Add" per linked feature; feature data is already on the project, use `featureToMarkdown` and add `.cursor/feature-{id}.md` to spec.
- **Markdown builders**: Reuse/expand `design-to-markdown.ts` with `designRecordToMarkdown`; add `architecture-to-markdown.ts` and `feature-to-markdown.ts` for full record → .md.
- **Project Spec**: Show "(exported)" for entries that have `content`. Add "Download all to .cursor" button when running in Tauri, project has `repoPath`, and at least one spec file has content. On click: for each spec file with `content`, call Tauri `write_spec_file(projectPath, relativePath, content)` to write into the project directory (e.g. `repoPath/.cursor/design-x.md`).
- **Tauri**: New command `write_spec_file(project_path, relative_path, content)` that creates parent dirs if needed and writes the file under `project_path/relative_path`.

## Consequences

- Users can export Design, Architecture, and Features as .md from the project page and have them in Project Spec alongside files picked from .cursor.
- One "Download all to .cursor" action writes all exported spec files to the project's `.cursor` folder (Tauri only; requires repo path).
- API and Tauri persist `specFiles` including `content`; preview already uses `content` when present (ADR 065).
