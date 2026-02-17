# ADR 0036: Ticket create — fallback to DB when agent output parse fails

## Status

Accepted.

## Context

When creating a ticket via "Generate ticket from prompt" (Tauri), the app runs an agent and parses its stdout for a single JSON object with `title`, `description`, `priority`, `featureName`. If the agent output was not valid or differently shaped, the user saw: "Could not parse agent output. Expected a single JSON object with title, description, priority, featureName." and no ticket was created. Users expect to be able to create tickets and have them stored in the DB.

## Decision

- **Fallback when parse fails:** If the agent output cannot be parsed, do not only show an error. Instead, set a generated ticket from the user's prompt (title = prompt slice, description = prompt, priority = P1, featureName = "Uncategorized") and show an info toast: "Could not parse agent output. Use the ticket below (from your description), pick Milestone and Idea, then add to backlog." The user can then pick milestone/idea and add to backlog, which creates the ticket in the DB via the existing `confirmAddGeneratedTicketToBacklog` flow.
- **More lenient parsing:** Accept both `featureName` and `feature_name` from agent JSON. Treat any parsed object that has at least `title` or `description` as valid; use prompt for missing fields.

## Implementation

- `src/components/molecules/TabAndContentSections/ProjectTicketsTab.tsx`:
  - Added `normalizeTicketParsed()` to map agent JSON (including snake_case `feature_name`) to the expected shape.
  - `extractTicketJsonFromStdout()` now returns normalized shape.
  - In the `parse_ticket` run-complete handler: when parsing returns null or no title/description, set `generatedTicket` from the user's prompt and show the info toast instead of an error; user can still add to backlog (DB).

## Consequences

- Ticket creation always leads to a DB ticket when the user confirms (Add to backlog). Parse failure no longer blocks creation.
- Agent output that uses `feature_name` is accepted.
- Manual "Add ticket" dialog continues to create tickets in the DB only (unchanged).
