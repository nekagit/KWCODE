# ADR 109: Todos analysis — single run, Kanban format in prompt, JSON on .md load

## Status
Accepted

## Context
- Users ran the Analysis button for tickets and features, then Sync, but the Kanban showed no tickets. The analysis was running **twice** (tickets prompt then features prompt), and the generated markdown sometimes did not match the parser’s expected format, so parsing returned empty.
- Users wanted: (1) analysis to run **once** and produce both `.cursor/tickets.md` and `.cursor/features.md`, (2) output that reliably parses for the Kanban (checklist/ticket/feature structure), and (3) **todos-kanban.json** to be written as soon as the .md files are available, without requiring a separate Sync click for JSON.

## Decision

1. **Single prompt, single run for tickets and features**
   - "Analysis (tickets & features)" now uses **one** prompt: `buildTicketsAnalysisPrompt(...)`, which already instructs the model to create **both** `.cursor/tickets.md` and `.cursor/features.md` in the same run.
   - Removed the two-prompt flow: no more `analysisDialogPrompts` for this flow, no sequential `run_analysis_script` (wait for `script-exited`, then run again). The dialog shows one prompt and "Run in Cursor" invokes the script **once**.
   - ADR 102 is superseded for this flow: we no longer run two prompts in sequence.

2. **Exact Kanban format in the analysis prompt**
   - In `buildTicketsAnalysisPrompt` (in `src/lib/analysis-prompt.ts`) added an **"Exact format for Kanban/JSON parsing"** section that specifies:
     - **tickets.md**: Each ticket line must be exactly `- [ ] #N Title — description` or `- [x] #N Title — description` (space inside brackets; em dash before description; `#### Feature: Name` above the ticket list).
     - **features.md**: Each feature line must be exactly `- [ ] Feature name (optional description) — #1, #2` or `- [x] Feature name — #1` (space inside brackets; em dash before ticket refs).
   - This aligns generated content with the parser in `src/lib/todos-kanban.ts` (e.g. `FEATURE_CHECKLIST_RE`, ticket line pattern) so the Kanban and JSON are populated after Sync.

3. **Write `todos-kanban.json` when .md files are loaded (Tauri)**
   - When the project details page has loaded both `cursorTicketsMd` and `cursorFeaturesMd` (i.e. after the two file-read effects), and the app is running in Tauri with a project `repoPath`, the app **writes** `.cursor/todos-kanban.json` in the project repo with `parseTodosToKanban(featuresMd, ticketsMd)`.
   - Implemented as a `useEffect` in `src/app/projects/[id]/page.tsx` depending on `cursorTicketsMd`, `cursorFeaturesMd`, `project?.repoPath`, and `isTauri`. So whenever the .md files are read (initial load or after Sync), the JSON file is updated immediately in the repo.
   - Sync still writes the same JSON when the user clicks Sync; the new effect ensures the JSON is also written when the page simply loads the two .md files (e.g. after Cursor has written them and the user reopens the project or refreshes).

4. **Toasts and copy behavior**
   - "Run in Cursor" toast: "Analysis script started. Cursor will open once and create both .cursor/tickets.md and .cursor/features.md. When done, click Sync to load the Kanban."
   - "Save prompt to .cursor" no longer mentions "first prompt" or "run both in sequence"; single toast: "Prompt saved to .cursor/analysis-prompt.md".

## Consequences
- Analysis runs **once** in Cursor, producing both markdown files in one go, so the workflow is simpler and the model keeps ticket numbers and feature names in sync.
- Stricter format instructions in the prompt improve the chance that generated content parses and the Kanban shows features and tickets.
- `todos-kanban.json` is written both on Sync and when the two .md files are loaded in the UI (Tauri), so the JSON is "immediately" present whenever the app has the .md content.
- ADR 102’s two-prompt sequential run is no longer used for "Analysis (tickets & features)".
