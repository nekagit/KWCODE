# ADR 0159: Prompts page — Run prompt from list

## Status

Accepted.

## Context

The Prompts page lists saved prompt records with actions (Copy ID, Copy prompt, View, Edit, Delete) but no way to run a prompt directly. Users had to open the Run tab and select the prompt there, or copy the prompt and run it manually. Running a saved prompt from the list improves workflow for power users who want to execute a prompt without leaving the Prompts page.

## Decision

- **Prompts page**: Add a "Run" button (Play icon) per prompt row that runs that prompt on the first active project via the existing terminal agent (`runTempTicket` from the run store).
- **PromptRecordsPageContent.tsx**: Implement `handleRunPrompt(prompt)` using `defaultProjectPath` (activeProjects[0] ?? allProjects[0]) and `runTempTicket(projectPath, prompt.content, label)`. If no project is selected: toast "Select at least one project on the Dashboard first." On success: toast "Prompt running. Check the Run tab." (or "Prompt queued…" when run is queued).
- **PromptRecordTable.tsx**: Add optional prop `onRunPrompt` and pass it to each `PromptTableRow`.
- **PromptTableRow.tsx**: Add optional `onRunPrompt` prop and a "Run" button (Play icon, emerald styling) that calls `onRunPrompt(prompt)` when provided. Button is only rendered when `onRunPrompt` is defined.

## Consequences

- Users can run a saved prompt from the Prompts page with one click; the run appears in the Run tab (same terminal slots as other temp-ticket runs).
- Behaviour is consistent with "Generate prompt" on the same page (which also uses `runTempTicket` and first active project).
- When no project is selected, a clear toast guides the user to the Dashboard.
- No new Tauri commands or API routes; reuses existing run store and terminal agent flow.
