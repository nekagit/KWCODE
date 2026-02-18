# ADR 0136 — Project Milestones tab: Download and Copy current milestone content as Markdown

## Status

Accepted.

## Context

The project detail **Milestones** tab lists DB milestones and shows the selected milestone’s markdown content in a preview panel. It had no way to export or copy that content. Other project-detail tabs (Testing, Design, Architecture, Tickets) support Download as Markdown and/or Copy as Markdown. Adding the same for the selected milestone content aligns behaviour and lets users save or paste the content elsewhere.

## Decision

- Add **`src/lib/download-milestone-document.ts`** with:
  - **`downloadMilestoneContentAsMarkdown(content, filenameBase)`** — trigger file download with filename `{filenameBase}-{filenameTimestamp()}.md`. Empty content: toast and no-op.
  - **`copyMilestoneContentAsMarkdownToClipboard(content)`** — copy via `copyTextToClipboard` (toast handled there). Empty content: toast and return false.
- In **ProjectMilestonesTab**, in the panel that shows the selected milestone’s content, when content is present: add a toolbar with **Download as Markdown** and **Copy as Markdown** buttons (FileText and Copy icons). Use `safeNameForFile(selectedMilestone.name, selectedMilestone.slug || "milestone")` for the download filename base.

## Consequences

- Users can download or copy the currently selected milestone’s content as Markdown from the Milestones tab.
- Same pattern as Testing, Design, and Architecture tabs; no new UI patterns. Run `npm run verify` to confirm tests, build, and lint pass.
