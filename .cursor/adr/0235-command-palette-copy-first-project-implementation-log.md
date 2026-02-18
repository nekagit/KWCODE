# ADR 0235: Command palette — Copy first project implementation log

## Status

Accepted.

## Context

The Control tab shows implementation log entries per project. There was no way to copy that log from the command palette. Keyboard-first users could not paste the log into tickets, Slack, or docs without opening the project and the Control tab.

## Decision

- Add one command palette action: **Copy first project implementation log**.
- New lib `src/lib/copy-implementation-log-to-clipboard.ts`: `copyImplementationLogToClipboard(projectId)` uses `fetchImplementationLogEntries(projectId)`, formats entries as plain text (ticket #, title, completed_at, summary, files changed), copies via `copyTextToClipboard`; toasts on empty/success/failure.
- Command palette handler uses same guards as "Copy first project path": require active project, resolve project by path, then call with `proj.id`.
- Document the action in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can copy the first active project's implementation log to the clipboard from ⌘K without opening the project.
- Format is readable plain text (one block per entry with separator). Behavior matches single source of truth from `fetchImplementationLogEntries`.
