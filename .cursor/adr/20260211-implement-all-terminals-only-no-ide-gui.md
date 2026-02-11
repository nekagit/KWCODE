# ADR 20260211: Implement All – terminals only, no IDE GUI

## Status
Accepted

## Context
`script/implement_all.sh` previously controlled the Cursor IDE GUI (activate Cursor, open integrated terminal, send keystrokes, paste prompts into Cursor's terminal). The user wants to interact only with terminals inside the Tauri app: no mention of or interaction with Cursor as an IDE.

## Decision
- Remove from the script all references to Cursor as an application or process (no "tell application \"Cursor\"", no "process \"Cursor\"").
- Remove all GUI automation that targeted Cursor: send_enter, paste_in_terminal, open_terminal, new_terminal_tab, type_agent_and_enters, and the logic that sent ticket prompts into Cursor's integrated terminal (first 3 tabs, wait 3 min, remaining tickets).
- Keep only: (1) validation of -P and .cursor/tickets.md and ticket count for reporting; (2) opening a new system Terminal in the background with `cd PROJECT_PATH && agent`; (3) returning focus to the frontmost app (the Tauri app) so the app log/card stays in view.
- Update all comments and echo messages to say "Tauri app", "app", or "agent" instead of "Cursor CLI" or "Cursor". The path `.cursor/tickets.md` remains (project data path, not the IDE).
- Script output is only to stdout so the Tauri app's terminal card in project details shows the full log.

## Consequences
- Implement All only opens a Terminal and runs agent; no IDE automation. All info is shown in the Tauri app's log/card.
- Ticket list is still validated from .cursor/tickets.md but is no longer sent automatically into any IDE; user runs agent in the opened terminal as needed.
