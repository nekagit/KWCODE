# ADR 0129 — Prompts page: Copy as JSON and Copy as CSV

## Status

Accepted.

## Context

The Prompts page has two tabs: ".cursor prompts" (files from `.cursor/**/*.prompt.md`) and "General" (prompt records from the API). Each tab already had Export JSON, Export CSV, Copy as Markdown, and Download as Markdown where applicable. Users had no way to copy the same data as JSON or CSV to the clipboard without creating a file, which is a pattern available on Run history, Ideas, Projects list, Configuration, and Documentation.

## Decision

- **General prompts:** In `src/lib/download-all-prompts-json.ts`, **`copyAllPromptsAsJsonToClipboard(prompts)`** already existed. In `src/lib/download-all-prompts-csv.ts`, add **`copyAllPromptsAsCsvToClipboard(prompts)`** using existing `promptsToCsv` (exported for reuse), `copyTextToClipboard`, and toasts.
- **.cursor prompts:** In `src/lib/download-all-cursor-prompts-json.ts`, add async **`copyAllCursorPromptsAsJsonToClipboard()`** (fetch from `/api/data/cursor-prompt-files-contents`, build same payload as download, copy, toast). In `src/lib/download-all-cursor-prompts-csv.ts`, add async **`copyAllCursorPromptsAsCsvToClipboard()`** (fetch same API, build CSV with existing `cursorPromptsToCsv`, copy, toast).
- **PromptRecordsPageContent:** In the ".cursor prompts" toolbar add "Copy as JSON" and "Copy as CSV" buttons next to Copy as Markdown (same disabled state as Export). In the "General" toolbar add "Copy as JSON" and "Copy as CSV" next to Copy as Markdown. Use FileJson/Copy icons and same aria-labels/titles as other copy actions.

## Consequences

- Users can copy all prompts (general or .cursor) as JSON or CSV to the clipboard from the Prompts page, for pasting into spreadsheets or scripts without creating a file.
- Aligns Prompts page with Run history, Ideas, Projects list, Configuration, and Documentation (clipboard JSON/CSV where applicable).
- Minimal new code: three new lib functions (one general CSV copy, two .cursor JSON/CSV copy); UI was already wired where implementations existed.
