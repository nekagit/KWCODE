# ADR 0037: Planner Manager — remove optional Details field

## Status

Accepted.

## Context

The Planner Manager (project Tickets tab) had two inputs: a short "What do you want?" text input and an optional "Details (optional)" textarea. The prompt sent to the ticket-generation flow was the concatenation of both. To simplify the UI and reduce friction, the optional details field was removed.

## Decision

- **Remove the Details (optional) textarea** from the Planner Manager accordion.
- **Use only the main input** for the prompt: `plannerPromptInput.trim()` is passed to the ticket-generation flow; no second field or concatenation.
- **Remove state** `plannerPromptTextarea` and `setPlannerPromptTextarea`; update `generateTicketFromPrompt` and its dependency array accordingly.

## Implementation

- `src/components/molecules/TabAndContentSections/ProjectTicketsTab.tsx`:
  - Removed `plannerPromptTextarea` / `setPlannerPromptTextarea` state.
  - In `generateTicketFromPrompt`, prompt is now `plannerPromptInput.trim()` only.
  - Removed the "Details (optional)" label and textarea block from the Planner Manager UI.

## Consequences

- Simpler Planner Manager: one input instead of two.
- Users can still describe what they want in the single "What do you want?" field; longer descriptions go in that field.
