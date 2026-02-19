# ADR 0230: Initialize and Starter with .cursor_init.zip and project_template.zip

## Status

Accepted.

## Context

Project detail had a single **Initialize** button that in Tauri unzipped `project_template.zip` into the project root. Users wanted to use **.cursor_init.zip** to seed the project’s `.cursor` folder (with merge when `.cursor` already exists), and a separate **Starter** action that applies both the project template and the cursor init template.

## Decision

- **Initialize**: In Tauri, unzip **.cursor_init.zip** into the project; extract as **.cursor** (strip one top-level dir from the zip, e.g. `cursor_init/`). If `.cursor` already exists, **merge**: only add missing files/folders (do not overwrite). In browser, keep existing behavior: fetch `/api/data/cursor-init-template` and write files under `.cursor/`.
- **Starter** (new button): In Tauri, (1) unzip **project_template.zip** into the project root, (2) unzip **.cursor_init.zip** as `.cursor` with the same merge logic. In browser, Starter behaves like Initialize (cursor-init only; no project template unzip).
- **Zip resolution**: Both zips are bundled as Tauri resources (`cursor_init.zip`, `project_template.zip`) so the built app finds them. Fallback: when not bundled, look next to the app (e.g. `project_root().join(".cursor_init.zip")` / `project_template.zip`) for dev.
- **Rust**: New command `unzip_cursor_init(app, target_path, merge_if_exists)`. `unzip_project_template` now takes `(app, target_path)` and resolves the zip from bundle resource first, then project root. Merge rule: when writing a zip entry to `target_path/.cursor/...`, if the destination file already exists and `merge_if_exists` is true, skip it.
- **Placeholder zips**: Repo includes minimal `.cursor_init.zip` and `project_template.zip` (e.g. one file each) so the bundle succeeds; replace with full content as needed.

## Consequences

- Initialize seeds only `.cursor` from .cursor_init.zip (merge when present). Starter seeds full project template then .cursor.
- Built app works from Desktop without placing zips next to the app (resources are bundled).
- Single source of merge behavior: at apply time, only write where the file does not exist.
