# ADR 0287 — Projects list export as Markdown

## Status

Accepted.

## Context

- The Projects list page and command palette support exporting the projects list as **JSON** (download/copy) and **CSV** (download/copy); see ADR 0224 and related.
- There was no **Markdown** export for the projects list. Users who want a human-readable list (e.g. for documentation or sharing in issues) had to use JSON or CSV only.

## Decision

- Add **Projects list export as Markdown**:
  - **New lib** `src/lib/download-projects-list-md.ts`:
    - `projectsListToMarkdown(projects)` — builds Markdown: title, exportedAt, count, table with columns: Name, ID, Repo path, Description, Prompts, Tickets, Ideas.
    - `downloadProjectsListAsMarkdown(projects)` — downloads `projects-list-{timestamp}.md`; toast on empty/success.
    - `copyProjectsListAsMarkdownToClipboard(projects)` — same content to clipboard; toast on empty/success/failure.
  - Reuse `filenameTimestamp`, `triggerFileDownload`, `copyTextToClipboard` from existing helpers.
- **Command palette:** Add two actions: "Download projects list as Markdown", "Copy projects list as Markdown" (after existing projects list JSON/CSV entries). Handlers call `listProjects()` then the new lib.
- **keyboard-shortcuts.ts:** Add two Command palette descriptions for the new actions.
- **Projects list page** (`ProjectsListPageContent.tsx`): In the Export toolbar, add "MD" (Download as Markdown) and "Copy MD" (Copy as Markdown) buttons, same style as JSON/CSV.

## Consequences

- Users can export the projects list as a readable Markdown table from the Projects page or via ⌘K.
- Format aligns with other list exports (timestamp, count, table); pipe characters in cell content are escaped for valid Markdown.
- No new routes or store changes; one new lib and minimal touches to CommandPalette, keyboard-shortcuts, and ProjectsListPageContent.
