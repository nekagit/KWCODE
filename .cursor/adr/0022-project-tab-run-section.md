# ADR 0022: Project tab Run section (Analyze + scripts + Play to run)

## Status

Accepted.

## Context

Users wanted a single place in the Project tab to understand what Analyze does, see all package.json scripts, and run the app (or any script) with one click. When the process outputs a localhost URL (e.g. dev server), that URL should be saved and offered as an "Open app" link from within the app.

## Decision

- **Run section in Project tab:** Add a "Run" section to the Project tab in project details that:
  - Explains the Analyze button (short text: regenerates project docs from repo and prompt).
  - Loads `package.json` from the project repo and lists all scripts.
  - For each script, shows a Play button (Tauri only) that runs `npm run <script>` in the project directory via a new Tauri command `run_npm_script`.
  - Shows a terminal slot (TerminalSlot) in the same tab for the run started from there, with Stop and (when detected) "Open app" link.
- **Localhost URL detection:** When script output is streamed via `script-log`, the frontend parses each line for `http://localhost:PORT` or `http://127.0.0.1:PORT`. The first match is stored on the run as `localUrl`. Run type and run store support `localUrl`; hydration sets it when a matching line is received.
- **Open app:** Wherever a run is displayed (Project tab Run section, TerminalSlot), if `run.localUrl` is set, show an "Open app" button/link that opens that URL.
- **Browser fallback:** In browser (no Tauri), Play is disabled and a tooltip explains "Run scripts in Tauri app".
- **Tauri:** New command `run_npm_script(project_path, script_name)` spawns `npm run <script_name>` in the project directory, streams stdout/stderr via existing `script-log` / `script-exited`, and registers the process in RunningState so `stop_run` works. Script name is validated (alphanumeric, hyphen, underscore only).

## Implementation

- `src/types/run.ts`: Added optional `localUrl?: string` to Run.
- `src/store/run-store.ts`: Added `setLocalUrl(runId, localUrl)` and `runNpmScript(projectPath, scriptName)`; runNpmScript invokes Tauri `run_npm_script` and pushes the run into `runningRuns`.
- `src/store/run-store-hydration.tsx`: In `script-log` listener, regex-detect localhost URL on each line; if run has no `localUrl`, call `setLocalUrl(run_id, url)`.
- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx`: Run section with package.json scripts load, Play buttons, Analyze explanation, TerminalSlot for last run, Stop, and Open app when `localUrl` set.
- `src/components/shared/TerminalSlot.tsx`: `TerminalRunData` extended with `localUrl`; when set, show "Open app" link in header.
- `src-tauri/src/lib.rs`: `run_npm_script_inner` and `run_npm_script` command; spawn npm in project dir, same script-log/script-exited and RunningState pattern.

## Consequences

- Users can run the app (or any script) from the Project tab without leaving the page; output and "Open app" appear in place.
- Localhost URL is captured from any run that prints it (Next.js, Vite, etc.) and offered as a one-click link.
- In browser, Run section still shows scripts but execution requires Tauri.
