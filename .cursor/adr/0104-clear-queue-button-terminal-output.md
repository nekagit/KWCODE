# ADR 0104 — Clear queue button in terminal output (Worker status bar)

## Status

Accepted.

## Context

Users can queue multiple terminal-agent tasks (fast dev, debug, ask-only, etc.) when all three terminal slots are busy. There was no way to cancel or clear the pending queue without waiting for runs to finish or refreshing the app.

## Decision

- **Store:** Add `clearPendingTempTicketQueue` to the run store. It sets `pendingTempTicketQueue` to an empty array so all queued temp-ticket jobs are dropped.
- **UI:** In the Worker status bar (terminal output area), when there are queued tasks (`pendingQueueLength > 0`), show a **Clear queue** button next to the "Queued" pill. Clicking it calls `clearPendingTempTicketQueue()` and shows a success toast.

## Consequences

- Users can clear all queued tasks in one action from the Run tab.
- Only pending (not yet started) jobs are cleared; already running terminals are unaffected.
- The button is only visible when the queue is non-empty, keeping the status bar uncluttered.
