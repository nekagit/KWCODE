# ADR 0048: Implement All terminal slot — "Failed (exit N)" wording and docs (Ticket #1)

## Status

Accepted.

## Context

ADR 0046 added script exit code to the Implement All flow and required the terminal slot UI to show "Done" / "Done in Xs" for success and "Failed (exit N)" for non-zero exit. The initial implementation showed "Done in Xs (exit N)" for failures. This ADR completes the UX and documentation for Ticket #1.

## Decision

1. **Terminal slot label**  
   When a run is done and the script exited with a non-zero code, show **"Failed (exit N)"** (not "Done ... (exit N)").

2. **Failed state styling**  
   Use a distinct visual state (rose border/header) for failed runs so success and failure are distinguishable at a glance.

3. **Documentation**  
   - **Usage guide** (`docs/guides/usage-guide.md`): Describe that terminal slots show "Done" / "Done in Xs" for success and "Failed (exit N)" for failure.
   - **Workflows** (`docs/development/workflows.md`): Add a bullet that Implement All terminal slots display script exit status when a run finishes.

## Consequences

- Users immediately see success vs failure without reading the log.
- Documentation matches the actual UI behaviour.

## References

- ADR 0046: Implement All — script exit code in UI
- `src/components/shared/TerminalSlot.tsx` — status label and statusColor (rose for failed)
- `docs/guides/usage-guide.md`, `docs/development/workflows.md`
