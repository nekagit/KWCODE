# ADR 0103 — Project architectures: Download and copy as Markdown

## Status

Accepted.

## Context

The Architecture tab on the project details page lists that project’s architectures and offers per-item **Copy as Markdown** and **Download as Markdown** in the view dialog. There was no way to export or copy the full visible list as one Markdown document, unlike the Design tab, Run history, Ideas, and Prompts, which support "Download as Markdown" and "Copy as Markdown" for the list.

## Decision

- Add a shared module `src/lib/download-project-architectures-md.ts` that:
  - Builds a single Markdown string for a list of architecture records (`buildProjectArchitecturesMarkdown(architectures)`), using the existing `architectureRecordToMarkdown` shape per record.
  - Format: `# Project architectures`, export timestamp, count, then each architecture as a section.
  - Exposes `downloadProjectArchitecturesAsMarkdown(architectures)` and `copyProjectArchitecturesAsMarkdownToClipboard(architectures)` using `download-helpers` and `copy-to-clipboard`.
- In `ProjectArchitectureTab`, when the project has resolved full architecture records and the list is non-empty, add an Export toolbar with **Download as Markdown** and **Copy as Markdown** that operate on the current visible/sorted list (same order as the grid). Export buttons are shown only when full records are available (e.g. from `getProjectResolved`).

## Consequences

- Users can export or copy all visible project architectures as one Markdown file or clipboard content without opening each architecture’s view dialog.
- Behaviour and empty-handling live in one place; the UI only wires the buttons to the lib.
- Aligns the Architecture tab with the export/copy patterns used on the Design tab, Run history, Ideas, and Prompts.
