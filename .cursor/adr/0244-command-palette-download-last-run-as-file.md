# ADR 0244: Command palette — Download last run as file

## Status

Accepted.

## Context

The command palette has "Copy last run to clipboard" (plain text) and "Download run history" (all runs as file). Users could not download only the **last** run as a file from ⌘K without copying first or downloading the full history. Keyboard-first users asked for a one-step way to save the most recent run to disk.

## Decision

- Add a command palette action **"Download last run as file"** that:
  - Uses the most recent run from terminal output history (same as "Copy last run").
  - Formats it as plain text in the same format as copy (header line + output).
  - Triggers a browser download with filename `last-run-{safeLabel}-{timestamp}.txt`.
- New lib **`src/lib/download-single-run-as-plain-text.ts`**: export `downloadSingleRunAsPlainText(entry)`. Reuse format from copy-single-run (header + output); use `triggerFileDownload` from download-helpers; toast on success. If no run, caller shows "No run history to download" (CommandPalette).
- Document the action in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can download the last run as a plain text file from ⌘K in one action.
- File content matches what "Copy last run" would paste, so behavior is consistent.
- Single new lib; CommandPalette and shortcuts get one handler and one entry each.
