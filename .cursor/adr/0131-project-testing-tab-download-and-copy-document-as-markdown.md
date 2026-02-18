# ADR 0131 — Project Testing tab: Download and Copy current document as Markdown

## Status

Accepted.

## Context

The project detail **Testing** tab lists testing documents (e.g. `.cursor/1. project/testing.md` and prompts under `.cursor/1. project/testing/`) and shows a preview of the selected file. It had no way to export or copy that content. Other project-detail tabs (Design, Architecture, Tickets) support Download as Markdown/JSON and Copy as Markdown/JSON. Adding the same for the selected testing document aligns behaviour and lets users save or paste the content elsewhere.

## Decision

- Add **`src/lib/download-testing-document.ts`** with:
  - **`downloadTestingDocumentAsMarkdown(content, filename)`** — trigger file download with filename `{base}-{filenameTimestamp()}.md` (base derived from the given filename, e.g. "testing.md" → "testing-2025-02-18-1430.md"). Empty content: toast and no-op.
  - **`copyTestingDocumentAsMarkdownToClipboard(content)`** — copy via `copyTextToClipboard` (toast handled there). Empty content: toast and return false.
- In **ProjectTestingTab**, in the document preview section, when content is present: add **Download as Markdown** and **Copy as Markdown** buttons (FileText and Copy icons), using the selected item's `name` for the download filename base.

## Consequences

- Users can download or copy the currently selected testing document as Markdown from the Testing tab.
- Same pattern as other tabs; no new UI patterns. Run `npm run verify` to confirm tests, build, and lint pass.
