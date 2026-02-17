# ADR 0063: Planner tab — remove Generate AI prompt from Kanban

## Status
Accepted (2025-02-17)

## Context
The Planner tab (ProjectTicketsTab) included a "Generate Kanban Prompt" section (GenerateKanbanPromptSection) that let users build an AI prompt from the current Kanban state.

## Decision
- Remove the Generate Kanban Prompt block from the Planner tab.
- Remove the related state (`kanbanPrompt`, `kanbanPromptLoading`) and the `generateKanbanPrompt` callback.
- Remove the import of `GenerateKanbanPromptSection`. Keep `buildKanbanContextBlock` / `combinePromptRecordWithKanban` where still used for other planner logic.

## Consequences
- Planner tab no longer shows the Generate AI prompt from Kanban UI; the rest of the tab (kanban, add ticket, planner manager, etc.) is unchanged.
