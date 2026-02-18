# ADR 0100 — Project designs: Download and copy as Markdown

## Status

Accepted.

## Context

The Design tab on the project details page lists that project’s designs and offers per-item **Download as Markdown**, **Copy as Markdown**, and **Download as JSON**. There was no way to export or copy the full visible list as one Markdown document, unlike Run history, Ideas, and Prompts, which support "Download as Markdown" and "Copy as Markdown" for the list.

## Decision

- Add a shared module `src/lib/download-project-designs-md.ts` that:
  - Builds a single Markdown string for a list of design records (`buildProjectDesignsMarkdown(designs)`), including only records with `config` (same rule as single design download).
  - Format: `# Project designs`, export timestamp, count, then each design as a section using the existing `designRecordToMarkdown` shape.
  - Exposes `downloadProjectDesignsAsMarkdown(designs)` and `copyProjectDesignsAsMarkdownToClipboard(designs)` using `download-helpers` and `copy-to-clipboard`.
- In `ProjectDesignTab`, when the design list is non-empty, add an Export toolbar with **Copy as Markdown** and **Download as Markdown** that operate on the current visible/sorted list (same as Run history and Ideas).

## Consequences

- Users can export or copy all visible project designs as one Markdown file or clipboard content without downloading each design separately.
- Behaviour and empty-handling live in one place; the UI only wires the buttons to the lib.
- Aligns the Design tab with the export/copy patterns used on Run history, Ideas, and Prompts.
