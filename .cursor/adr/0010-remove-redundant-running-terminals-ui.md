1. Context
    The UI was displaying a "RUNNING TERMINALS" section on the left sidebar, which was redundant and not intended. This was identified as a duplication issue.

2. Decision
    The `RunningTerminalsPopover` component was being imported in `AppShell.tsx` and `TerminalStatusBadge.tsx`. Upon investigation, it was determined that the `RunningTerminalsPopover` was not directly responsible for the "RUNNING TERMINALS" text on the left sidebar. The `TerminalStatusBadge` component, which uses `RunningTerminalsPopover`, was being rendered in `AppShell.tsx`, leading to the confusion. The decision was to remove the import and usage of `RunningTerminalsPopover` from `AppShell.tsx` and also remove the rendering of `RunningTerminalsPopover` inside `TerminalStatusBadge.tsx`.

3. Status
    Completed.

4. Consequences
    The redundant "RUNNING TERMINALS" section on the left sidebar has been removed, cleaning up the UI. The codebase is now more aligned with the intended design, without unnecessary imports and component renderings.