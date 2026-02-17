# ADR 0001: Initialize from project_template.zip

## Status

Accepted.

## Context

Users create a new folder as a project in KWCode (desktop) and want to get a complete Next.js starter in one action. Previously, Initialize copied only the `.cursor_template` (or `.cursor_inti`) contents into the project as `.cursor/`, which did not provide a full app scaffold.

## Decision

- **Desktop (Tauri):** The **Initialize** button in project details is bound to unzipping `project_template.zip` into the project root. The zip is read from next to the app (project root in dev; for production, place `project_template.zip` next to the executable or bundle it).
- If the zip has a single top-level directory (e.g. `project_template/`), that prefix is stripped so that template contents land at the project root (e.g. `package.json`, `src/`, `.cursor/` at root).
- **Web (browser):** Initialize still uses the existing flow: copy `.cursor_template` into the project as `.cursor/` via the API.

## Consequences

- New projects get the full Next.js starter (deps, Prisma, components, prompts, etc.) in one click when using the desktop app.
- `project_template.zip` must be present next to the KWCode app (repo root in dev). For distributable builds, the zip can be bundled via Tauri resources or shipped alongside the app.
- The previous `.cursor`-only copy remains available in the browser and is still used when not in Tauri.
