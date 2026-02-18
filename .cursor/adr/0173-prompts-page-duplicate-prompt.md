# ADR 0173: Prompts page — Duplicate prompt

## Status

Accepted.

## Context

The Prompts page lists saved prompt records with Run, View, Edit, Delete, and Copy. Users could copy a prompt’s content to the clipboard or run it, but there was no one-click way to create a new prompt record that is a copy of an existing one. Creating variants (e.g. “same prompt, different wording”) required copying content, opening Create, pasting, and editing the title. A “Duplicate” action reduces steps and supports iterative prompt management.

## Decision

- **PromptTableRow**: Add an optional `onDuplicatePrompt?: (prompt: PromptRecord) => void` prop. When provided, show a Duplicate button (CopyPlus icon) in the row actions. Click calls `onDuplicatePrompt(p)` with stopPropagation so the row click does not open the view dialog.
- **PromptRecordTable**: Add optional `onDuplicatePrompt` and pass it to each `PromptTableRow`.
- **PromptRecordsPageContent**: Implement `handleDuplicatePrompt(p)`: derive title as `${p.title ?? "Prompt"} (copy)`.trim() and content as `p.content ?? ""`. In Tauri: call `invoke("add_prompt", { title, content })` then `refreshData()`. In browser: call `addPrompt(title, content)` then `fetch("/api/data/prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content }) })`, and if `res.ok` call `refreshData()`. Show toast "Prompt duplicated." on success or "Failed to duplicate prompt." on error. Pass `handleDuplicatePrompt` as `onDuplicatePrompt` to both the General tab table and each project tab table.
- No new Tauri commands or API routes; reuse existing `add_prompt` and POST `/api/data/prompts`.

## Consequences

- Users can create a copy of any saved prompt as a new record with one click; the new record has the same content and a title suffixed with " (copy)".
- Duplicate is available on the General tab and on each project tab where prompts are listed.
- Category and tags are not copied (backend only stores title and content for add); users can edit the new record to set them if needed.
- Run `npm run verify` to confirm tests, build, and lint pass.
