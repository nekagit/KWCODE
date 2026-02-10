# ADR 119: Commit dialog – AI-generated commit message from changes

## Context

The project details Git tab commit dialog (ADR 114) requires the user to type a commit message. Users wanted a way to generate a suggested message based on the current changes (git status / changed files) without leaving the dialog.

## Decision

- Add an **AI Generate** button in the commit changes modal, next to the "Message" label.
- **Input**: Use existing `gitInfo.status_short` (git status output with changed files) as context for generation. No new Tauri commands.
- **Backend**: New API route `POST /api/generate-commit-message` accepting `{ changes: string }` (validated via `generateCommitMessageSchema`). Uses OpenAI (gpt-4o-mini) with a system prompt to output a single-line commit message; encourage conventional commit style (feat:, fix:, docs:, chore:). Returns `{ message: string }`.
- **Frontend**: Button shows Sparkles icon and "Generate" label; shows loading spinner while request is in flight. On success, set the commit message textarea to the generated message. Button disabled when there are no changes (`!gitInfo?.status_short`) or while generating. Errors surfaced via toast.

## Consequences

- Users can get a suggested commit message from the current changes with one click, then edit or commit as-is.
- Relies on `OPENAI_API_KEY`; same pattern as other generate routes (generate-prompt, generate-tickets, etc.).
- Commit message remains editable after generation; user keeps full control.
