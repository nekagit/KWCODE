# ADR 072: Analysis script – run in Cursor and save results to .cursor

## Status

Accepted.

## Context

ADR 068 added Analysis buttons (Design, Architecture, Tickets, full) that open a dialog with a prompt; the user copies the prompt and runs it manually in Cursor. Users want to **execute** the analysis from the project details page: when pressing the Analysis button on any card (e.g. Tickets), a script should run that executes the prompt in the Cursor window of that project and saves results in the project’s `.cursor` folder.

## Decision

- **New script: `script/run_analysis_single_project.sh`**
  - Tailored to the project-details analysis use case.
  - Usage: `run_analysis_single_project.sh -P /path/to/project`
  - Expects the prompt to already exist at `project_path/.cursor/analysis-prompt.md` (written by the app before invoking the script).
  - Sources `script/common_cursor_run.sh` and reuses: `set_clipboard`, `open_cursor_project`, `run_project` (focus Cursor window, focus left panel, Cmd+N new agent, paste, Enter).
  - Flow: copy prompt file to clipboard → open Cursor at project → focus window → new agent → paste → submit. The AI runs in Cursor and writes outputs (e.g. `.cursor/ANALYSIS.md`, `.cursor/design.md`, `.cursor/tickets.md`) into the project’s `.cursor` folder.

- **Tauri**
  - New command: `run_analysis_script(project_path: String)`.
  - Resolves workspace root, runs `script/run_analysis_single_project.sh -P <project_path>` in a subprocess with the same stdout/stderr/exit handling as `run_script` (script-log, script-exited events, run_id, list_running_runs, stop_run).

- **Project details page**
  - Analysis dialog (unchanged: opens when user clicks Analysis on any card) gains a **“Run in Cursor”** button when in Tauri and project has a repo path.
  - On “Run in Cursor”: (1) write the current dialog prompt to the project’s `.cursor/analysis-prompt.md` via `write_spec_file`, (2) invoke `run_analysis_script` with the project’s `repoPath`, (3) show a success toast. The script then opens Cursor, pastes the prompt, and submits; results are saved in `.cursor` by Cursor.

## Consequences

- One-click “Run in Cursor” from the Analysis dialog executes the prompt in the project’s Cursor window and results are saved in `.cursor`.
- The script is reusable from the CLI (e.g. after writing `.cursor/analysis-prompt.md` by hand or from another tool).
- Same run lifecycle as existing prompts script (run_id, logs, stop) for consistency.
