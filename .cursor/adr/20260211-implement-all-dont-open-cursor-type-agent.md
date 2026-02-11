# ADR 20260211: Implement All – don't open Cursor; new terminal + "agent" for CLI

## Status
Accepted

## Context
`script/implement_all.sh` was opening Cursor at the project path, then using the integrated terminal and typing "agent" to invoke the Cursor CLI. User requirement: do not open Cursor from the script; at the **beginning** of the script, open a **new** (system) terminal, `cd` to the project path, and type/run "agent" there so the Cursor CLI is started.

## Decision
- **Beginning of script:** Open a new Terminal window (macOS Terminal.app) in the background and run `cd "$PROJECT_PATH" && agent` so the Cursor CLI starts. Capture the frontmost app before opening Terminal; after opening, re-activate that app so focus stays on the app and all info is visible in the app's log/card in project details. Wait a short delay (default 3s, `SLEEP_AFTER_TERMINAL`) after opening.
- Remove the block that launches Cursor (`cursor "$PROJECT_PATH"` / `open -a "Cursor"`).
- Keep the rest: activate Cursor, open integrated terminal, then for each ticket type "agent", Enter 3x, paste prompt (first 3 in 3 tabs, wait 3 min, then rest in new tabs).
- Header comments and echo text updated so the flow is clearly: first new terminal → cd → agent; then Cursor GUI automation.

## Consequences
- Cursor CLI is started in a new system terminal at the project path at the start of the run.
- No automatic launch of the Cursor app from the script; Cursor GUI automation still assumes Cursor is available for activation and integrated terminal control.
