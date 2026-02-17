# ADR 0046: Implement All — script exit code in UI (Ticket #1 implement further)

## Status

Accepted.

## Context

Ticket #1 requested to "implement further" the Implement All flow. The Worker tab runs agent scripts per terminal slot; when a run finishes, the UI showed "Done" or "Done in Xs" but did not distinguish success (exit 0) from failure (non-zero exit). The script exit code was available in the Rust backend when the child process exited but was not forwarded to the frontend.

## Decision

1. **Backend (Tauri)**  
   Add `exit_code: Option<i32>` to the `script-exited` event payload. When the script child process exits, capture `status.code()` from `try_wait()` before removing the run entry, and emit it so the frontend can show success vs failure.

2. **Frontend**  
   - Store `exitCode?: number` on run state when handling `script-exited`.  
   - In the terminal slot UI, when a run is done: show "Done" (or "Done in Xs") for exit code 0 or missing; show "Failed (exit N)" when exit code is non-zero.

3. **Documentation**  
   Mention in workflow/usage docs that Implement All terminal slots display the script exit status when a run finishes.

4. **Testing**  
   Add unit tests for run-helpers used by the Implement All flow (e.g. `parseTicketNumberFromRunLabel`, `isImplementAllRun`).

## Consequences

- Users can see at a glance whether an Implement All slot succeeded or failed without scanning the log.
- Exit code is optional in the payload so older frontends or other listeners remain compatible.
- Run-helpers are covered by tests, reducing regressions when changing label formats.

## References

- ADR 0043: Implement All timing and duration tracking
- `src-tauri/src/lib.rs` — `ScriptExitedPayload`, script-exited emit sites
- `src/store/run-store-hydration.tsx` — script-exited listener
- `src/components/shared/TerminalSlot.tsx` — status label when done
- `src/lib/run-helpers.ts` — label parsing and format helpers
