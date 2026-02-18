# ADR 0088: Copy prompt record as Markdown to clipboard

## Status

Accepted. Implemented 2025-02-18 (night shift).

## Context

Prompt records can be downloaded as a markdown file and copied as raw content. Design and Architecture records already support both download and "copy as markdown" to clipboard. For consistency and UX, prompt records should also support copying as formatted markdown (title as heading + content) so users can paste into docs or other tools without downloading a file.

## Decision

- **Add `copyPromptRecordToClipboard(title, content)`** in `src/lib/download-prompt-record.ts` (same module as `downloadPromptRecord`). Format: `# {title}\n\n{content}`. Empty content shows a toast and returns false; otherwise delegates to `copyTextToClipboard` (which shows success toast).
- **Add "Copy as Markdown" button** in `PromptContentViewDialog` that calls this function. The dialog keeps "Copy prompt" (raw content) and the new "Copy as Markdown" (formatted document).

## Consequences

- Users can copy a prompt as a markdown document (heading + body) to the clipboard, aligned with Design and Architecture copy behaviour.
- Single place for empty-check and toast; future changes to format (e.g. metadata) can be done in one function.
- Run `npm run verify` to confirm tests, build, and lint pass.
