# ADR 0237: Command palette — Download first project implementation log

## Status

Accepted.

## Context

The command palette already has **Copy first project implementation log** (ADR 0235). There was no way to **download** the same data as a file from the palette. Keyboard-first users who want to save the log to disk (e.g. for backup or sharing) had to open the project and Control tab.

## Decision

- Add one command palette action: **Download first project implementation log**.
- Export `formatImplementationLogAsText(entries)` from `src/lib/copy-implementation-log-to-clipboard.ts` so copy and download share the same format.
- New lib `src/lib/download-implementation-log.ts`: `downloadImplementationLog(projectId)` uses `fetchImplementationLogEntries(projectId)`, `formatImplementationLogAsText(entries)`, and `triggerFileDownload` from `@/lib/download-helpers` with filename `implementation-log-{filenameTimestamp()}.md`; toasts on empty/success/failure.
- Command palette handler uses same guards as "Copy first project implementation log": require active project, resolve project by path, then call with `proj.id`.
- Document the action in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can download the first active project's implementation log as a timestamped file from ⌘K without opening the project or Control tab.
- Format matches the copy action (one block per entry with separator). Single formatter keeps copy and download in sync.
