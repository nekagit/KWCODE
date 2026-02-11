# ADR: Delete unused RunningTerminalsPopover organism

## Context
After ADR 0010 (remove-redundant-running-terminals-ui), the `RunningTerminalsPopover` component was no longer imported or rendered anywhere. The component file remained in `src/components/organisms/RunningTerminalsPopover.tsx` as dead code.

## Decision
Delete the unused file `src/components/organisms/RunningTerminalsPopover.tsx` to remove dead code and keep the organisms folder consistent with actual usage.

## Status
Completed.

## Consequences
- One fewer unused file in the codebase.
- No runtime or import impact; the component was already unreferenced.
- If running-terminals popover UI is needed again, it can be re-added or implemented differently.
