# ADR 095: Todos tab — Prompt card with Kanban context always combined

## Status

Accepted.

## Context

Users wanted a single, self-contained prompt experience on the Todos tab: choose an existing prompt from a dropdown or write their own, with no dependency on the previous Analysis dialog or other flows. Whatever prompt is used (existing or custom) must always be combined with the Kanban board data (features and tickets from `.cursor/features.md` and `.cursor/tickets.md`) so the model has full context when copying, saving to `.cursor`, or running in Cursor.

## Decision

1. **Prompt card on Todos tab**
   - Add a new accordion item **Prompt** at the top of the Todos tab (project details page), expanded by default with the Kanban accordion.
   - The card is independent of the Analysis dialog and Setup-tab prompts; it does not replace or remove any existing Analysis buttons on Features/Tickets/Design/Architecture cards.

2. **Source: dropdown or custom**
   - **Dropdown (Source):** "Custom (write your own)" plus one option per existing prompt from the app (same list as `/api/data/prompts`). When an existing prompt is selected, its content is fetched and loaded into the prompt text area so the user can see and edit it.
   - **Prompt text area:** Holds either the loaded prompt content or the user’s custom text. This is the “user part” of the final prompt.

3. **Always combine with Kanban**
   - The **effective prompt** used for Copy, Save to .cursor, and Run in Cursor is always:  
     `[Kanban context block]` + `---` + `[user prompt text]`.
   - **Kanban context block:** Built from the current Kanban data (parsed features and tickets). Includes a short header and sections: Features (checklist lines with ticket refs) and Tickets (by priority P0–P3). Implemented as `buildKanbanContextBlock(kanbanData)` in `src/lib/analysis-prompt.ts`. If no features/tickets are parsed, the block states that and suggests running Sync after creating the `.cursor` files.
   - **Combination:** `combinePromptWithKanban(kanbanContext, userPrompt)` prepends the Kanban block to the user’s text so every action (copy, save, run) uses the same combined prompt.

4. **Actions**
   - **Copy to clipboard:** Copies the combined prompt (Kanban + user text). Toast: "Prompt (with Kanban context) copied to clipboard."
   - **Save to .cursor:** Writes the combined prompt to `.cursor/analysis-prompt.md` via Tauri `write_spec_file` (same filename as the existing analysis flow). Disabled when not Tauri or no repo path.
   - **Run in Cursor:** Same as Save, then invokes `run_analysis_script` so Cursor runs the prompt. Disabled when not Tauri or no repo path.

5. **Implementation details**
   - New helpers in `src/lib/analysis-prompt.ts`: `buildKanbanContextBlock(data)`, `combinePromptWithKanban(kanbanContext, userPrompt)`, and type `KanbanContextData` (features and tickets in minimal shape to avoid circular deps).
   - State on project details page: `todosPromptSelectedId` ("custom" or numeric id), `todosPromptBody` (textarea value), `todosPromptContentLoading`, `todosPromptCopied`, `todosPromptSaving`. When dropdown selects an existing prompt, `GET /api/data/prompts/:id` loads content into `todosPromptBody`.

## Consequences

- Users get one place on the Todos tab to pick or write a prompt and use it with full Kanban context, without touching the Analysis dialog or Setup.
- Features and tickets are always included in the prompt, so the model consistently has scope from the board.
- Copy / Save to .cursor / Run in Cursor all use the same combined prompt. The Run flow continues to use `.cursor/analysis-prompt.md` and the existing analysis script behavior.
