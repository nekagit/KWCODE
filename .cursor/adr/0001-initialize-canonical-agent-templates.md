# ADR 0001: Initialize copies .cursor_inti as .cursor

## Status
Accepted

## Context
The "Initialize" action for new projects should create a `.cursor` folder that is an exact copy of a single source folder (`.cursor_inti`). No inline templates, no extra files—just the folder contents renamed to `.cursor`.

## Decision
- **Single source folder:** Use `.cursor_inti` in the repo as the only template. When the user clicks Initialize, copy every file from `.cursor_inti` into the project as `.cursor/<same relative path>`.
- **Browser mode:** Next.js API GET `/api/data/cursor-init-template` reads `.cursor_inti` from `process.cwd()` and returns `{ files: { "agents/frontend-dev.md": "content...", ... } }`. The client then writes each file to the project via existing `writeProjectFile(projectId, ".cursor/" + path, content, repoPath)`.
- **Tauri mode:** Tauri command `get_cursor_init_template` reads `.cursor_inti` from `project_root()` (app/repo root) and returns the same file map; the client writes each file via `write_spec_file`.

## Consequences
- New projects get exactly what is in `.cursor_inti`, nothing more. To change what gets copied, edit `.cursor_inti` only.
- No `public/cursor-templates`; no inline templates used for Initialize.

## References
- `src/lib/api-projects.ts`: `initializeProjectRepo()` — fetches template then writes each file
- `src/app/api/data/cursor-init-template/route.ts`: reads `.cursor_inti` and returns file map
- `src-tauri/src/lib.rs`: `get_cursor_init_template` — reads `.cursor_inti` from project root
- `.cursor_inti/`: the only source for Initialize
