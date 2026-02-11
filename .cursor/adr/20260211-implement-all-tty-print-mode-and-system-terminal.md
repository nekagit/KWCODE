# Implement All: TTY vs print mode and "Open in system terminal"

## Status
Accepted (2026-02-11)

## Context
When the user runs "Implement All" from the app, the script runs inside the Tauri process with **piped stdout/stderr** (no real terminal / no TTY). The Cursor Agent CLI detects that it is not attached to a TTY and switches to **"print mode"**, which expects a prompt via `-p`. Without `-p` it errors: `ERROR: NO PROMPT PROVIDED FOR PRINT MODE`. On the user's MacBook, typing `agent` in Terminal.app gives a **real TTY**, so the CLI runs in **interactive mode** (no prompt required). The user wanted the same behavior as their normal terminal—no prompt, interactive agent.

## Decision
1. **Explain print mode**: "Print mode" is the Cursor CLI's non-interactive mode when it sees no TTY; it requires a prompt with `-p`. Interactive mode (like Terminal.app) only happens when the process has a TTY.
2. **Add "Open in system terminal" (macOS)**: New primary action that opens **3 Terminal.app windows**, each running `cd project_path && agent`. This gives a real TTY so the agent runs interactively, like the user's MacBook. Implemented as Tauri command `open_implement_all_in_system_terminal(project_path)` using `osascript` to tell Terminal to `do script "cd 'path' && agent"` three times.
3. **Keep in-app "Implement All"**: Still runs the script in-process; output appears in the app's terminal cards. Without a prompt the agent will still error with "NO PROMPT PROVIDED FOR PRINT MODE". Prompt selection is optional (for print-mode usage). Tooltip and toasts direct users to "Open in system terminal" for interactive agent.
4. **No prompt required**: User is not forced to select a prompt; "Implement All" can run with or without a prompt. The recommended way to get a normal terminal experience is "Open in system terminal".

## Consequences
- Users get a one-click way to open 3 real terminals with interactive Cursor CLI.
- In-app terminals remain useful for log capture when using a prompt (print mode) or for viewing script output; for interactive use they use the system terminal.
- "Open in system terminal" is macOS-only; on other platforms the command returns an error (could be extended later with platform-specific equivalents).
