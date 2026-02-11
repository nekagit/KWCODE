# ADR 20260211: Implement All – script and app aligned to 3 split terminals

## Status
Accepted

## Context
Project details has a 3-split terminal section (Terminal 1, 2, 3). The script and app needed to work so that one "Implement All" action fills all three terminals, each running its own agent session for that slot.

## Decision

### Script (`script/implement_all.sh`)
- Add optional **`-S 1|2|3`** (terminal slot). Usage: `$0 -P /path/to/project [-S 1|2|3]`.
- When `-S` is set, echo "Implement All – Terminal slot N of 3" so logs clearly identify the slot.
- Same behavior otherwise: validate project path and tickets, then run `agent` at project path. Each invocation is one process whose output goes to one run/terminal in the app.

### Tauri
- **`run_implement_all(project_path, slot?: number)`**: optional `slot` (1, 2, or 3). When provided, pass `-S` and the number to the script.
- Label per run: `"Implement All (Terminal 1)"`, `"Implement All (Terminal 2)"`, `"Implement All (Terminal 3)"` when slot is 1, 2, 3; otherwise `"Implement All"`.
- `run_implement_all_script_inner` accepts `slot: Option<u8>` and adds `-S` arg to the script when slot is 1..3.

### Frontend
- **One click starts 3 runs:** `runImplementAll(projectPath)` invokes `run_implement_all` three times with `slot: 1`, `slot: 2`, `slot: 3`, and appends three runs to `runningRuns` with labels "Implement All (Terminal 1)", etc.
- **Run filtering:** Treat any run whose label is `"Implement All"` or starts with `"Implement All ("` as an Implement All run (for Stop all, Clear, Archive, and the 3-slot grid).
- **Slot order in grid:** Last three Implement All runs are shown as [oldest of three, middle, newest] so that after a single click, Terminal 1 is left, Terminal 2 center, Terminal 3 right.

## Consequences
- Clicking "Implement All" starts three agent processes (one per slot); each terminal in the project details shows one run. Script output is clearly labeled by slot.
- Stop all / Clear / Archive continue to apply to all Implement All runs (including the new labels).
