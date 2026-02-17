# ADR 0044: Planner Manager — remove stray setPlannerPromptTextarea reference

## Status

Accepted.

## Context

ADR 0037 removed the Planner Manager "Details (optional)" textarea and the state `plannerPromptTextarea` / `setPlannerPromptTextarea`. The implementation removed the state and UI but left a call to `setPlannerPromptTextarea("")` in `confirmAddGeneratedTicketToBacklog`, causing a runtime reference error when a user confirmed adding a generated ticket to the backlog.

## Decision

- **Remove the stray call** to `setPlannerPromptTextarea("")` in `ProjectTicketsTab.tsx` inside `confirmAddGeneratedTicketToBacklog`.
- Reset of planner input after adding a generated ticket is already achieved via `setPlannerPromptInput("")`; no additional reset is needed.

## Implementation

- `src/components/molecules/TabAndContentSections/ProjectTicketsTab.tsx`:
  - In `confirmAddGeneratedTicketToBacklog`, removed the line `setPlannerPromptTextarea("");` after `setPlannerPromptInput("")`.

## Consequences

- Confirming "Add to backlog" for a generated ticket no longer throws; behavior matches ADR 0037.
- No new state or API; fix is minimal and scoped to the incomplete removal in 0037.

## References

- ADR 0037: Planner Manager — remove optional Details field.
