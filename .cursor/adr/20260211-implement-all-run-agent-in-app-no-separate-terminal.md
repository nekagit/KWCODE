# ADR 20260211: Implement All – run agent in-app, no separate terminal window

## Status
Accepted

## Context
Implement All previously opened macOS Terminal.app via osascript to run `cd PROJECT_PATH && agent`, so a separate Terminal window appeared. The user wanted the terminal to run inside the Tauri app only, with all output in the app's log card.

## Decision
- Change `script/implement_all.sh` to run `agent` in-process: after validation, run `( cd "$PROJECT_PATH" && agent )` in the same script process. Tauri already pipes the script's stdout/stderr to the frontend via `script-log` events, so all agent output streams to the "Implement All – Terminal" card with no separate window.
- Remove all osascript usage (no Terminal.app, no "return focus"). Remove macOS/AppleScript from requirements in the script header.
- Capture agent exit code and exit the script with that code so the run store shows success/failure correctly.
- Update the Implement All terminal card subtitle in `ProjectTicketsTab.tsx` to: "Click « Implement All » to run agent in-app; logs appear here."

## Consequences
- No separate Terminal window; all output is shown in the Tauri app's project-details terminal card.
- Script is portable (no macOS-only osascript). Agent runs as a child of the bash process Tauri spawns; when agent exits, the script exits and the run is marked done.
