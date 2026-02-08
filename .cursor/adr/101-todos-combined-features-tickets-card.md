# ADR 101: Todos tab — combined Features & Tickets card

## Status
Accepted

## Context
The Todos tab had two separate accordion cards: "Features" (features.md, linked features, Analysis, Archive) and "Tickets" (tickets.md, linked tickets, Analysis, Archive). Users wanted a single card where both models (features.md and tickets.md) are shown together and all actions apply to both.

## Decision
1. **Single accordion item**  
   Replace the two items `todos-features` and `todos-tickets` with one: `todos-features-tickets` titled "Features & Tickets (X linked features, Y linked tickets)".

2. **Content**  
   - Intro line: both files are shown together; Analysis creates both; Archive archives both; Sync (in Kanban) loads/validates both.  
   - Section: .cursor/features.md (scroll area).  
   - Section: .cursor/tickets.md (scroll area).  
   - Spec files: two drop zones side by side ("Spec files for features", "Spec files for tickets") so linking behavior is unchanged.  
   - Linked features list (Run / Queue) and linked tickets list (Run) in two columns.  
   - **Buttons (always both):**  
     - **Analysis (creates tickets.md & features.md)** — opens the Tickets analysis dialog (which creates both files in sync).  
     - **Archive both** — archives tickets.md then features.md to .cursor/legacy/ and creates new empty files for both.

3. **Archive both**  
   - New handler `archiveBothCursorFiles`: sets `archiveLoading` to `"both"`, invokes `archive_cursor_file` for "tickets" then "features", reloads both files, toasts "Archived both tickets.md and features.md to .cursor/legacy/ and created new files."  
   - `archiveLoading` type extended to `"tickets" | "features" | "both" | null` so the single "Archive both" button shows loading when `archiveLoading === "both"`.

4. **Accordion default**  
   Default open value updated from `["todos-prompt", "todos-kanban", "cursor-files", "todos-features", "todos-tickets"]` to `["todos-prompt", "todos-kanban", "cursor-files", "todos-features-tickets"]`.

## Consequences
- One place for features and tickets content and actions; Archive and Analysis always operate on both.  
- Copy and help text updated (e.g. "Run Analysis in the Features & Tickets card").
