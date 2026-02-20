# ADR 0333: App Close Cleanup - Clear Queues and Kill Agents

## Status
Accepted

## Context
When the application closes (via window close, Cmd+Q, or any other means), running agents and queued jobs were left in an inconsistent state. Agents could become orphaned processes continuing to run in the background, and queue state would persist incorrectly.

## Decision
Implement comprehensive cleanup on app close at both the Rust/Tauri backend and frontend levels:

### Backend (Rust/Tauri)
- Add `on_window_event` handler to catch `CloseRequested` events
- Kill all running agent processes using `SIGKILL` (Unix) and `child.kill()`
- This ensures no orphaned processes remain after app closes

### Frontend (React/TypeScript)
- Add `beforeunload` event handler in `RunStoreHydration`
- Clear all pending queues (`pendingTempTicketQueue`, `nightShiftIdeaDrivenIdeasQueue`)
- Disable night shift mode and clear its callbacks
- Invoke `stop_script` Tauri command to signal backend cleanup

## Consequences

### Positive
- No orphaned agent processes after app closes
- Clean state on next app launch
- Consistent behavior across all close methods (window X, Cmd+Q, force quit)

### Negative
- Running agents are immediately terminated without graceful shutdown
- Any pending queue items are lost (intentional for clean state)

## Implementation

### Files Changed
- `src-tauri/src/lib.rs`: Added `on_window_event` handler
- `src/store/run-store-hydration.tsx`: Added `beforeunload` handler and `cleanupOnClose` function
