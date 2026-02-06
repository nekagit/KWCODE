# ADR 053: Feature tab – add to queue (+ per item) and run queue later

## Status

Accepted.

## Context

The Feature tab lists features; each has Run and Use in run. Users want to select multiple features into a predefined queue and execute the queue later in order (one run after another), instead of running each manually.

## Decision

- **Queue state**: Add a feature queue to the run store (`featureQueue: FeatureQueueItem[]`, `queueRunningRunId: string | null`). Persist queue in memory only (not to disk).
- **Types**: Introduce `FeatureQueueItem` in `src/types/run.ts` with `id`, `title`, `prompt_ids`, `project_paths` (minimal data needed to run).
- **Run store**:
  - `addFeatureToQueue(feature)` – add feature if not already in queue.
  - `removeFeatureFromQueue(id)` – remove by id.
  - `clearFeatureQueue()` – clear queue and reset queue run id.
  - `runFeatureQueue(activeProjectsFallback)` – run first item in queue (using its projects or fallback), set `queueRunningRunId` to the started run id.
  - `runWithParams` returns `Promise<string | null>` (run_id) so queue can track the started run.
  - `runNextInQueue(exitedRunId)` – when the run that exited is the current queue run, remove first from queue and start the next; called from script-exited listener.
- **Hydration**: In `run-store-hydration.tsx`, on `script-exited` call `runNextInQueue(payload.run_id)` after updating running runs, so the queue advances when each run finishes.
- **Feature tab UI**:
  - Each feature row: **Plus** button to add to queue (tooltip: "Add to run queue"); if already in queue, show **Minus** button to remove (tooltip: "Remove from queue"). Plus disabled when feature has no prompts.
  - When queue is non-empty: show "Queue (N)" with **Run queue** and **Clear queue** buttons next to the Filter by project row. Run queue uses active projects as fallback when feature has no project_paths.
- **Execution order**: Queue runs one feature at a time; when the current run exits (Tauri `script-exited`), the next in queue is started automatically until the queue is empty.

## Consequences

- Users can build a list of features and run them in sequence without clicking Run for each.
- Queue is session-scoped; refreshing the app clears it.
- Run store owns queue and run advancement; Feature tab only adds/removes and triggers "Run queue".
