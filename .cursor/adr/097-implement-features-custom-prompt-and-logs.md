# ADR 097: Implement Features with custom prompt and run logs on project details

## Status
Accepted

## Context
When using "Implement Features" with a **custom prompt** (set as active on the Todos tab):

1. The process started but **logs were empty** and the user did not see the script doing anything.
2. Root cause: the backend only supported running the script by **prompt IDs** (from `prompts-export.json`). The frontend sent `combinedPrompt` for custom text, but the Rust `run_script` command did not accept it; the script was invoked with empty prompt IDs and exited immediately with "No prompt IDs specified", so there was almost no output and nothing useful in the UI.

Additionally, the **project details page** did not show run logs, so even when the script produced output, the user had to switch to Run/Home to see it.

## Decision
1. **Backend support for combined prompt**
   - **Script** (`script/run_prompts_all_projects.sh`): Add `-F /path/to/file` option. When `-F` is present, use that file as the full prompt content instead of building from prompt IDs. If neither `-p` nor `-F` is given, exit with a clear error.
   - **Rust** (`src-tauri/src/lib.rs`): Extend `run_script` to accept optional `combined_prompt`. When provided, write content to a temp file and invoke the script with `-F <path>` and the projects file. Introduce `RunScriptArgs` struct with `#[serde(rename_all = "camelCase")]` so the frontend payload (e.g. `combinedPrompt`, `promptIds`) deserializes correctly.

2. **Logs on project details page**
   - When "Implement Features" is running (or has just finished), show the current run’s log lines in a dedicated **run log** block on the same tab (Todos), so the user sees script output without leaving the page. Display "Waiting for script output…" when `logLines` is empty and the run is still active.

## Consequences
- Custom prompts used as "active" for Implement Features now drive the script correctly; the script runs and produces output.
- Users see the script log on the project details page (Todos tab) while Implement Features is running or for the last run.
- Run log block is shown only when `implementFeaturesRunId` is set (running or finished), and uses existing `runningRuns` / `script-log` and `script-exited` events from the run store.
