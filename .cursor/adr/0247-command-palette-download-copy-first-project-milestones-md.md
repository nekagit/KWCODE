# ADR 0247: Command palette and Milestones tab — Download/Copy first project milestones as Markdown

## Status

Accepted.

## Context

The app already supported Download/Copy first project milestones as JSON and CSV from the command palette (⌘K) and from the Milestones tab. The project Tickets list has a matching Markdown export (list-level). There was no way to export the first project's milestones list as Markdown from ⌘K or from the Milestones tab, creating a parity gap with tickets and with other milestone export formats.

## Decision

- **New lib** `src/lib/download-project-milestones-md.ts`:
  - Export `buildProjectMilestonesMarkdown(milestones, options?)` — builds a single Markdown string: "# Project milestones", project name, exportedAt, count, then per-milestone sections (name, slug, id, created_at, updated_at, content if present). Escape `#` in user content for valid Markdown.
  - Export `downloadProjectMilestonesAsMarkdown(milestones, options?)` — same format, triggers file download with filename `project-milestones-{timestamp}.md`; toast on empty/success.
  - Export `copyProjectMilestonesAsMarkdownToClipboard(milestones, options?)` — same format, copy to clipboard; toast on empty/success/fail.
- **Command palette:** Add "Download first project milestones as Markdown" and "Copy first project milestones as Markdown" (resolve first project, fetch milestones via existing `resolveFirstProjectMilestones`, then call the new lib). Same pattern as first-project milestones JSON/CSV.
- **Milestones tab:** Add "Export Markdown" and "Copy Markdown" buttons next to existing JSON/CSV export buttons, using the same lib with current tab `milestones` and `project.name`.
- **Keyboard shortcuts:** Document both actions in the Command palette (⌘K) group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy the first project's milestones list as Markdown from the command palette and from the Milestones tab, aligning with JSON/CSV and with the tickets list Markdown export.
- One shared lib keeps format and behavior consistent; Command palette and tab both use it.
