# ADR 005: Remove workspace path setting — single project root

## Status

Accepted.

## Context

The app previously allowed users to set a "workspace" path (stored in app data as `workspace_path.txt`) and showed UI to select or type that path. All JSON data (tickets, features, projects, prompts) and the run script were resolved relative to that path. Users wanted no configurable workspace: the app should use a single, fixed project root with all data and scripts in place.

## Decision

- **Remove workspace path setting entirely.** No UI to set or select a folder, no persisted path in app data.
- **Use auto-detected project root only:** `std::env::current_dir()`; if the current directory contains `src-tauri/`, use its parent. Validate that the chosen directory contains `script/run_prompts_all_projects.sh` and `data/`.
- **Backend:** Replace `workspace_dir(app)` with `project_root()` (no config file read/write). Remove Tauri commands `get_workspace_dir` and `set_workspace_dir`. All data and script paths continue to resolve from the same root (`data/*.json`, `script/run_prompts_all_projects.sh`).
- **Frontend:** Remove workspace state (`workspaceDir`, `workspaceInput`), remove "Workspace" accordion and "Set workspace" quick action, remove `setWorkspace` and `selectWorkspaceFolder`. Load data on startup without fetching or displaying a path.
- **Scripts:** No change. `script/run_prompts_all_projects.sh` already derives `WORKSPACE_ROOT` from `SCRIPT_DIR`; the Tauri app invokes it with `current_dir(&ws)` so the script runs in the project root.

## Consequences

- Simpler UX: no workspace setup step. Run the app from the repo root (or from a child dir like `src-tauri`) and it finds `script/` and `data/` automatically.
- All JSONs and script usage stay in the same layout; only the source of the root path changes (no config file).
- If the app is run from a directory that is not the repo root and does not have `script/` and `data/`, it will error with a clear message to run from the repo root.

## References

- Best practice for AI/dev tools: reduce configuration surface; prefer convention (single project root) over configurable paths when the repo layout is fixed.
