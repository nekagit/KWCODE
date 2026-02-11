# ADR 20260211: Implement All button and terminal card on project details Todo tab

## Status
Accepted

## Context
Users need a one-click way to open Cursor at the current project path from the project details Todo tab (next to the kanban for tickets), with script output visible in the app. The flow should run a bash script in the background that starts the Cursor CLI and opens the current project path, while showing logs in a terminal-style card.

## Decision

1. **Script**  
   Add `script/implement_all.sh` that:
   - Accepts `-P /path/to/project` (required).
   - Sources `common_cursor_run.sh` and calls `open_cursor_project "$PROJECT_PATH"` to open Cursor at that path.
   - Echoes clear log lines so the UI terminal card shows progress.

2. **Tauri backend**  
   - Add `implement_all_script_path(ws)` and `run_implement_all_script_inner(...)` (same pattern as `run_analysis_script_inner`: spawn bash script with `-P project_path`, pipe stdout/stderr, emit `script-log` and `script-exited`).
   - Add `run_implement_all(project_path: String)` command that returns `RunIdResponse` and register it in the invoke handler.

3. **Run store**  
   - Add `runImplementAll(projectPath: string): Promise<string | null>` that invokes `run_implement_all`, then appends a run with label `"Implement All"` to `runningRuns` and sets `selectedRunId`, so existing script-log/script-exited handling continues to work.

4. **Project details Todo tab (ProjectTicketsTab)**  
   - Add an **Implement All** button next to “Add ticket” and “Add feature”, shown only when `isTauri` and `project.repoPath` is set. On click, call `runImplementAll(project.repoPath)`.
   - Add an **Implement All – Terminal** card that:
     - When there are no “Implement All” runs: shows placeholder text (“Click Implement All…”).
     - When there are “Implement All” runs: shows the most recent run’s label, status (Running… / Done), log lines in a scrollable area with auto-scroll, and a Stop button while running.

## Consequences

- Users can start “Implement All” from the Todo tab and see logs in an in-app terminal card without leaving the page.
- The same run appears in the global “Running terminals” list and can be stopped from either the card or the popover.
- Implement All is Tauri-only (script runs on the host); in browser builds the button and terminal card are not shown.
- One more script and Tauri command are maintained; behavior is consistent with existing analysis script and run-store patterns.
