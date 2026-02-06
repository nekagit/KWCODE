# ADR 020: Prompts page – Create, Edit, and Generate with AI

## Status
Accepted

## Context
The Prompts page listed prompts and allowed selecting them for run; there was no way to create, edit, or generate prompts from the UI. Users needed to manage `data/prompts-export.json` by hand or via external tools.

## Decision
- On the **Prompts** page, add three actions:
  1. **Create prompt** – Opens a dialog with Title and Content; on Save, POST to `/api/data/prompts` (no `id`) to append a new prompt to `data/prompts-export.json`, then refresh the list.
  2. **Edit prompt** – Enabled when exactly one prompt is selected. Fetches full prompt list from GET `/api/data/prompts`, finds the selected prompt by id, opens a dialog with Title and Content; on Save, POST to `/api/data/prompts` with `id` to update the existing record, then refresh the list.
  3. **Generate with AI** – Opens a dialog with a description field. User describes the desired prompt; on Generate, POST to `/api/generate-prompt` with `{ description }`. The API uses OpenAI to return `{ title, content }`. User can then edit the result and either "Save as new prompt" (POST create) or "Edit & create" (prefill Create dialog and save from there).
- Add **API routes**:
  - `GET /api/data/prompts` – Return full prompt list from `data/prompts-export.json` (including `content`) for the edit UI.
  - `POST /api/data/prompts` – Body: `{ id?: number, title: string, content: string, category?: string }`. If `id` provided and exists, update; otherwise create with next id. Write back to `data/prompts-export.json`. (Browser mode only; Tauri still reads the same file via `get_prompts`.)
  - `POST /api/generate-prompt` – Body: `{ description: string }`. Uses OpenAI (e.g. gpt-4o-mini) to generate a single prompt; returns `{ title, content }`. Requires `OPENAI_API_KEY`.
- Expose **refreshData** from run-state context so the prompts list refreshes after create/edit (reloads from Tauri or `/api/data`).
- Add **Dialog** UI component (shadcn-style, using `@radix-ui/react-dialog`) for Create, Edit, and Generate dialogs.

## Consequences
- Users can create and edit prompts from the Prompts page without touching the JSON file.
- AI-generated prompts can be created from a short description, then edited and saved.
- Create/Edit/Save work in browser mode; in Tauri, the same Next API is used when the app is served by the dev server, and `get_prompts` reads the updated file after refresh.
- New dependency: `@radix-ui/react-dialog`. New files: `src/components/ui/dialog.tsx`, `src/app/api/data/prompts/route.ts`, `src/app/api/generate-prompt/route.ts`.
