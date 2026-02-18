# ADR 0139 — Versioning tab: Copy changed files list and Download as Markdown

## Status

Accepted.

## Context

The project detail Versioning (Git) tab shows a "Changed files" list (status + path per line from `git status -sb`) but had no way to export or copy it. Users could not paste the list into tickets, docs, or save a snapshot. Other tabs (Testing, Milestones, Design, Architecture, Technologies) already offer "Download as Markdown" and/or "Copy" for their content.

## Decision

- Add **Copy list** (plain text) and **Download as Markdown** for the changed files list when there are changed files.
- **New lib** `src/lib/export-versioning-changed-files.ts`:
  - `buildChangedFilesPlainText(lines)` — one line per file (status + path).
  - `buildChangedFilesMarkdown(lines)` — Markdown with header and bullet list (`path` (status)).
  - `copyChangedFilesListToClipboard(lines)` — copy plain text; empty list → toast and no-op.
  - `downloadChangedFilesAsMarkdown(lines, filenameBase?)` — filename `changed-files-{base}-{timestamp}.md`; empty list → toast and no-op. Uses `triggerFileDownload`, `filenameTimestamp` from download-helpers; `copyTextToClipboard` from copy-to-clipboard.
- **ProjectGitTab**: In the "Changed files" card header row (when `changedFiles.length > 0`), add "Copy list" and "Download as Markdown" buttons (Copy and FileText icons). Filename base from `safeNameForFile(project.name ?? "", "project")`.

## Consequences

- Users can copy the changed files list to paste into tickets or chat, and download it as Markdown for documentation or history.
- Aligns the Versioning tab with other project-detail tabs that offer export/copy for their main content.
