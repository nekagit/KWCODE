# ADR 0318 — Worker Asking section: instant message in terminal section below

## Status

Accepted.

## Context

- In the Worker tab, the "Asking" section lets users type a question and run an ask-only agent. Previously, feedback appeared only after `loadAllAgentsContent` and `runTempTicket` completed, so there was a noticeable delay before anything showed in the terminal section below.
- Users wanted to see a message in the section below as fast as possible after submitting.

## Decision

1. **Show Ask runs in terminal slots**  
   - Include runs whose label starts with `"Ask:"` in `isImplementAllRun()` so they appear in the Terminal Output section like other temp-ticket runs.

2. **Placeholder run for immediate feedback**  
   - Add `addPlaceholderAskRun(label)` to the run store: it reserves the next free slot and adds a placeholder run to `runningRuns` with that label so a row appears in the terminal section immediately.
   - Support `meta.placeholderRunId` on temp-ticket jobs: when `processTempTicketQueue` runs a job with this set, it reuses the existing placeholder (no new run), starts the backend, and on success replaces the placeholder’s `runId` with the real `run_id`.

3. **Asking section flow**  
   - On "Ask" click: call `addPlaceholderAskRun(label)` first (so the run appears in the section below right away), clear the input, then in the background run `loadAllAgentsContent` and `runTempTicket(..., { placeholderRunId })` so the real run replaces the placeholder when the backend starts.

## Implementation

- `src/lib/run-helpers.ts`: Add `r.label.startsWith("Ask:")` to `isImplementAllRun`.
- `src/types/run.ts`: Add optional `placeholderRunId?: string` to `RunMeta`.
- `src/store/run-store.ts`:  
  - In `processTempTicketQueue`, if `job.meta?.placeholderRunId` is set, find that run, use its slot, and update that run’s `runId` when the invoke succeeds (instead of creating a new placeholder).  
  - Add `addPlaceholderAskRun(label)`: get next free slot, push a placeholder run with `runId: ask-placeholder-{timestamp}-{random}`, return runId; return null if no slot.
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx`: In `WorkerAskingSection`, on submit: call `addPlaceholderAskRun(label)`, clear input, then load agents and `runTempTicket` with `meta: placeholderRunId ? { placeholderRunId } : undefined`. Toast reflects whether a placeholder was shown or the job was only queued.

## Consequences

- Users see a run row in the terminal section immediately after clicking Ask, with the question label; the row is updated with the real run when the backend starts.
- If all slots are busy, no placeholder is added but the job is still queued and toast says so.
- Ask runs now appear in the same terminal slot grid as other temp-ticket runs (Ticket, Debug, Fast dev, etc.).
