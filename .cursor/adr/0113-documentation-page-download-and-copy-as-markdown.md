# ADR 0113 — Documentation page: Download and Copy as Markdown

## Status

Accepted.

## Context

The Documentation page points users to where app documentation lives (`.cursor/documentation/`, `docs/`) and provides "Open documentation folder" and "Copy path". Other pages (Configuration, Tech Stack, Ideas, Run history, Prompts) offer "Download as Markdown" and "Copy as Markdown" for their content; the Documentation page had no way to export or copy the page content as Markdown. Adding these actions extends the same pattern and gives users a shareable snapshot of the documentation locations and description.

## Decision

- Add **`src/lib/download-documentation-info-md.ts`** that:
  - Exports `buildDocumentationInfoMarkdown(exportedAt?)` for deterministic Markdown: "# Documentation", Exported at, description, bullet list of paths (`.cursor/documentation/`, `docs/`), and footer text.
  - Exports `downloadDocumentationInfoAsMarkdown()` that builds markdown and triggers file download as `documentation-info-{timestamp}.md` via `download-helpers`. Shows success toast.
  - Exports async `copyDocumentationInfoAsMarkdownToClipboard()` that builds the same markdown and copies to clipboard via `copy-to-clipboard`. Shows success toast on copy.
- In **DocumentationPageContent**, in the button row next to "Copy path", add **Download as Markdown** (FileText icon) and **Copy as Markdown** buttons that call the new functions.

## Consequences

- Users can download or copy the Documentation page content (title, description, paths) as Markdown from the Documentation page.
- Aligns Documentation with the export/copy pattern used on Configuration, Tech Stack, Ideas, Run history, and Prompts.
- Content is static (no Tauri/browser resolution); same output in both modes.
