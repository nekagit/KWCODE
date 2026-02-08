# ADR 094: Implement Features button on Kanban board

## Status

Accepted.

## Context

Users wanted a single action on the Kanban board that implements features one by one: take the top feature from the "To do" column and its associated tickets, run the existing script (run_prompts with project and prompts) to implement them following best practice, then when the run finishes mark that feature as done and mark its tickets as done (green border in the Kanban), and repeat until all features and tickets are done.

## Decision

1. **Implement Features button**
   - Add an **Implement Features** button in the Kanban accordion (project details → Todos tab), next to the Sync button.
   - Button is primary (default variant); shows a Play icon when idle and a spinner when the loop is running.
   - **Disabled when:** not in Tauri, project has no repo path, project has no linked prompts, no features left in "To do", or a run is already in progress.

2. **Flow**
   - On click: get the first feature in "To do" (from parsed `.cursor/features.md`). Get its ticket refs and the project’s linked prompts and repo path.
   - Call `runWithParams({ promptIds, activeProjects: [project.repoPath], runLabel: "Implement: <feature title>" })` so the existing run script runs for that single project with the linked prompts.
   - Store the run id and the current feature in state/ref so when the run exits we know which feature and tickets to mark done.
   - When the run is reported done (run status "done" in `runningRuns`): update `.cursor/tickets.md` to mark that feature’s ticket numbers as done (`- [x] #N ...`) and `.cursor/features.md` to mark that feature line as done (`- [x] ...`), using new helpers in `src/lib/todos-kanban.ts` (`markTicketsDone`, `markFeatureDoneByTicketRefs`). Write both files via Tauri `write_spec_file`, then update local state so the Kanban re-renders.
   - If there is another feature in "To do", start the next run for that feature and repeat; otherwise set running state to false and show "All features implemented."

3. **Markdown helpers**
   - `markTicketsDone(ticketsMd, ticketNumbers)`: replaces `- [ ] #N` with `- [x] #N` for each N in the given list.
   - `markFeatureDoneByTicketRefs(featuresMd, ticketRefs)`: finds the feature checklist line whose ticket refs match the given set and changes `[ ]` to `[x]`.

4. **Green border for done items**
   - In the Kanban UI, feature and ticket cards that are done (`f.done` / `t.done`) get a green border and ring: `border-emerald-500 ring-1 ring-emerald-500/30`, so done items are visually distinct.

5. **Tauri-only write-back**
   - Updating `.cursor/tickets.md` and `.cursor/features.md` on disk is done only in Tauri via `write_spec_file`. The button is disabled in browser mode so the loop does not run without the ability to persist.

## Consequences

- Users can run "Implement Features" once and have the app run the script for each To-do feature in order, then mark features and tickets done automatically so the board reflects progress.
- Done features and tickets are clearly indicated with a green border in the Kanban.
- The run script (and linked prompts) must be appropriate for "implementing" the listed tickets; the app does not change what the script does, only when it runs and how the board is updated after each run.
- Implement Features depends on project repo path and linked prompts; if prompts are not linked, the user is prompted to link them and the loop stops after the first run if they were removed mid-loop.
