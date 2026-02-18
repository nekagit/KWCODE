# ADR 0134 — Technologies page: Download and Copy for Libraries and Open source as Markdown

## Status

Accepted.

## Context

The **Technologies** page shows Tech stack (with Export/Copy as JSON and Download/Copy as Markdown), plus **Libraries & frameworks** (libraries.md) and **Open source / GitHub** (sources.md). Those two sections only had Edit; there was no way to export or copy their content. Aligning with the Testing tab and Documentation page, users should be able to download or copy libraries.md and sources.md as Markdown.

## Decision

- Add **`src/lib/download-technologies-document.ts`** with:
  - **`downloadTechnologiesDocumentAsMarkdown(content, filename)`** — trigger file download with filename `{base}-{filenameTimestamp()}.md`. Empty content: toast and no-op.
  - **`copyTechnologiesDocumentAsMarkdownToClipboard(content)`** — copy via `copyTextToClipboard`. Empty content: toast and return false.
- In **TechnologiesPageContent**:
  - **Libraries & frameworks** section: when `librariesMd` has content, add **Download as Markdown** and **Copy as Markdown** buttons (FileText and Copy icons) next to Edit, calling the new lib with content and `"libraries.md"`.
  - **Open source / GitHub** section: when `sourcesMd` has content, add the same two buttons with content and `"sources.md"`.

## Consequences

- Users can download or copy the Libraries and Open source documents as Markdown from the Technologies page.
- Same pattern as Testing tab document export; no new UI patterns. Run `npm run verify` to confirm tests, build, and lint pass.
