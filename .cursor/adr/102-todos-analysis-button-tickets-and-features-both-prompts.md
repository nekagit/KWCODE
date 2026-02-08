# ADR 102: Todos tab — Analysis button shows both tickets and features prompts and runs them in sequence

## Status
Accepted

## Context
In the project details Todos tab, the "Analysis (creates tickets.md & features.md)" button opened the analysis dialog with only the **tickets** prompt. Users wanted to see **both** the tickets and features prompts and, when using "Run in Cursor", to run both prompts **one after the other** (tickets first, then features).

## Decision

1. **New dialog kind: `tickets-and-features`**  
   - `openAnalysisDialog` accepts a new kind `"tickets-and-features"` in addition to `"design" | "architecture" | "tickets" | "features" | "full"`.  
   - When `tickets-and-features` is used, we set `analysisDialogPrompts` to a two-element array `[ticketsPrompt, featuresPrompt]` and `analysisDialogTitle` to "Analysis: Tickets & Features". Single-prompt flows continue to use `analysisDialogPrompt` and set `analysisDialogPrompts` to `null`.

2. **State**  
   - New state: `analysisDialogPrompts: string[] | null`.  
   - Dialog is open when `analysisDialogPrompt !== null` OR `(analysisDialogPrompts && analysisDialogPrompts.length > 0)`.

3. **Dialog UI**  
   - When `analysisDialogPrompts?.length >= 2`, the dialog shows two sections:  
     - "1. Tickets (creates .cursor/tickets.md & .cursor/features.md)" with the first prompt.  
     - "2. Features (updates .cursor/features.md)" with the second prompt.  
   - Description text explains that "Run in Cursor" runs both one after the other.  
   - Copy to clipboard copies both prompts with a separator: `"\n\n---\n\n## Second prompt (Features)\n\n" + prompt2`.

4. **Save to .cursor**  
   - When there are two prompts, we save only the first (tickets) to `.cursor/analysis-prompt.md` and show a toast: "First prompt (tickets) saved. Use Run in Cursor to run both prompts in sequence."

5. **Run in Cursor (sequential)**  
   - When there are two prompts:  
     - Write first prompt to `.cursor/analysis-prompt.md`, invoke `run_analysis_script`, get `run_id`.  
     - Subscribe to Tauri `script-exited` and wait until `payload.run_id === run_id`.  
     - Then write second prompt to `.cursor/analysis-prompt.md`, invoke `run_analysis_script` again.  
   - Toast: "Both analysis runs started. Cursor will run tickets then features in sequence; results in .cursor/".  
   - Single-prompt behavior is unchanged (write once, run once).

6. **Todos tab button**  
   - The Analysis button in the Todos tab (Features & Tickets card and/or Kanban section) now calls `openAnalysisDialog("tickets-and-features")` instead of `openAnalysisDialog("tickets")`.  
   - Button label/title updated to "Analysis (tickets & features)" and tooltip to describe running both prompts in sequence.

## Consequences
- Users see both the tickets and features prompts in one dialog and can copy both or run both in Cursor in order.  
- No backend changes: sequencing is implemented in the frontend by waiting on `script-exited` before starting the second run.
