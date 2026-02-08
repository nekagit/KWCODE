# ADR 098: Todos tab Prompt card — Add custom prompt and Generate AI

## Status
Accepted

## Context
On the project details page, Todos tab, the **Prompt** card lets users choose an existing prompt or write custom text; that prompt is combined with the Kanban (features and tickets from .cursor/features.md and .cursor/tickets.md) for copy, save, and Implement Features. Users needed:

1. A way to **save the current custom prompt** as a new prompt in the library (so it appears in the Source dropdown and on the Prompts page) without leaving the page.
2. A way to **generate a Cursor prompt from the current Kanban** (pending features and tickets) so the AI suggests an actionable prompt to finish them.

## Decision

1. **Add button**
   - Add an **Add** button in the Prompt card (Todos tab) that opens a dialog.
   - Dialog: title input (required); content is the current prompt text in the card. On Save: POST to `/api/data/prompts` with `{ title, content }`, refetch prompts list, close dialog, toast. The new prompt appears in the Source dropdown; user can select it or keep editing.

2. **Generate AI button**
   - Add a **Generate AI** button that analyses the current Kanban (features and tickets from the Todos tab) and generates a Cursor prompt to complete them.
   - New API: `POST /api/generate-prompt-from-kanban` with body `{ features, tickets }` (same shapes as `TodosKanbanData`). Uses OpenAI (gpt-4o-mini) with a system/user prompt that describes pending features and tickets and asks for a single JSON `{ title, content }` — actionable, priority-aware, step-by-step Cursor prompt. Returns `{ title, content }`.
   - Frontend: on click, call the API with `kanbanData.features` and `kanbanData.tickets`; set the prompt textarea to `content`; toast with generated title. Disabled when there are no pending features or tickets (with a clear toast if clicked).

3. **UI placement**
   - Both buttons live in the same row as Active, Copy to clipboard, Save to .cursor, Run in Cursor — Add and Generate AI first (before Active) for discoverability.

## Consequences
- Users can add a custom prompt from the Todos tab without going to the Prompts page.
- Users can one-click generate a prompt tailored to the current features and tickets; they can then edit, set Active, and run Implement Features.
- Generate AI requires `OPENAI_API_KEY` and pending Kanban data; empty Kanban is handled with a clear error message.
