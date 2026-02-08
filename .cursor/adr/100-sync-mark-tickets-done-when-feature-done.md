# ADR 100: Sync — mark tickets done when their feature is done

## Status
Accepted

## Context
Features in .cursor/features.md can be marked done (`[x]`) while the corresponding tickets in .cursor/tickets.md were still unchecked (`[ ]`). That left the Kanban showing features in Done but tickets without a green border, and the two files out of sync.

## Decision
1. **Sync behavior**  
   When the user clicks **Sync** on the Todos tab:
   - Parse features.md and tickets.md.
   - For every feature that is done, collect its ticket refs (#N).
   - Call `markTicketsDone(ticketsMd, ticketNumbersFromDoneFeatures)`.
   - If the result differs from the current tickets.md content:
     - **Tauri:** Write the updated content back to .cursor/tickets.md.
     - **Browser:** Still use the updated content in memory so the Kanban shows tickets as done (file cannot be written in browser).
   - Show a sync status message when tickets were updated, e.g. "Updated tickets.md: marked #1, #2 as done to match done features."

2. **markTicketsDone regex**  
   The replacement regex expected ticket lines like `- [ ] #N ...`. The rest after `[ ]` was captured with a leading space (` #N ...`). The number was extracted with `rest.match(/^#(\d+)/)`, which failed because of the leading space. Fixed by using `rest.match(/\s*#(\d+)/)` so the ticket number is found correctly and those lines are turned into `[x]`.

## Consequences
- After Sync, tickets that belong to done features are checked in tickets.md (when the app can write the file), and the Kanban shows them with the green border.
- One source of truth: if a feature is done, its tickets are treated as done in both UI and file when syncing.
