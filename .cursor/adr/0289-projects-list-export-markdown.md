# ADR 0289 — Projects list: Export as Markdown

## Status

Accepted.

## Context

The Projects list page and command palette already support exporting the projects list as JSON and CSV. There was no Markdown export. A human-readable list (e.g. table with name, id, path, description, counts) is useful for documentation and sharing.

## Decision

- **New lib** `src/lib/download-projects-list-md.ts`: build Markdown (title, exportedAt, count, table: Name, ID, Repo path, Description, Prompts, Tickets, Ideas); `downloadProjectsListAsMarkdown(projects)` and `copyProjectsListAsMarkdownToClipboard(projects)`; reuse `filenameTimestamp`, `triggerFileDownload`, `copyTextToClipboard`; toast on empty/error/success.
- **Command palette:** Add "Download projects list as Markdown" and "Copy projects list as Markdown" (handlers + entries after existing projects list JSON/CSV).
- **keyboard-shortcuts.ts:** Add two Command palette entries for projects list Markdown.
- **ProjectsListPageContent:** Add "Download as Markdown" and "Copy as Markdown" buttons in the Export toolbar (after CSV, same style as JSON/CSV).

## Consequences

- Users can export the projects list as Markdown from both the Projects page Export toolbar and the command palette (⌘K).
- Format aligns with other list exports (table with metadata header).
- Single new lib and minimal touches to CommandPalette, keyboard-shortcuts, and ProjectsListPageContent.
