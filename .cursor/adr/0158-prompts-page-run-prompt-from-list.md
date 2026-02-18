# ADR 0158 — Prompts page: Run prompt from list

## Status

Accepted.

## Context

The Prompts page lists saved prompt records with actions (Copy, View, Edit, Delete) but had no way to run a prompt directly. Users had to copy the prompt, open the Run tab, and paste there. Running a saved prompt from the list reduces steps and lets users execute a prompt without leaving the Prompts page.

## Decision

- Add a **Run** action per prompt row on the Prompts page (General tab and per-project tabs).
- **Behavior:** When the user clicks Run (Play icon), call `runTempTicket(defaultProjectPath, prompt.content, prompt.title)` where `defaultProjectPath = activeProjects[0] ?? allProjects[0] ?? ""`. If no project path, show toast "Select at least one project on the Dashboard first." and do not start the run. If content is empty, show toast "Prompt has no content." Otherwise start the run and show "Prompt running. Check the Run tab." (or "Prompt queued. Check the Run tab." when queued).
- **Components:** `PromptRecordsPageContent` already defines `handleRunPrompt` and passes `onRunPrompt` to `PromptRecordTable`. `PromptRecordTable` passes `onRunPrompt` to each `PromptTableRow`. `PromptTableRow` accepts optional `onRunPrompt` and renders a Run button (Play icon) when provided; click calls `onRunPrompt(prompt)` with stopPropagation so row click does not open view.
- No new Tauri commands or API routes; reuses existing `runTempTicket` from the run store.

## Consequences

- Users can run a saved prompt from the Prompts page with one click; the run executes on the first active project (or first project if none active) in a terminal slot. If no project is selected, they are prompted to select one on the Dashboard.
- Run button is only shown when the parent passes `onRunPrompt` (Prompts page does; other usages can omit it).
- Run `npm run verify` to confirm tests, build, and lint pass.
