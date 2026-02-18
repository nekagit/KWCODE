# ADR 0125 — Documentation page: Download as JSON and Copy as JSON

## Status

Accepted.

## Context

The Documentation page (ADR 0113) has "Download as Markdown" and "Copy as Markdown" for the page content (description and documentation paths). Other pages such as Configuration and App Info offer both Markdown and JSON export. Adding Download as JSON and Copy as JSON to the Documentation page gives parity and allows scriptable consumption of the same static info (paths and description) in JSON form.

## Decision

- Add **`src/lib/download-documentation-info-json.ts`** that:
  - Exports **`buildDocumentationInfoJsonPayload(exportedAt?)`** returning `{ exportedAt, description, paths: Array<{ path, description }> }` (same information as the Markdown export).
  - Exports **`downloadDocumentationInfoAsJson()`** that builds the payload, triggers file download as `documentation-info-{timestamp}.json`, and shows a success toast.
  - Exports async **`copyDocumentationInfoAsJsonToClipboard()`** that builds the same payload, copies pretty-printed JSON via `copyTextToClipboard`, and shows success or "Failed to copy to clipboard" toast.
- In **DocumentationPageContent**, in the button row next to "Copy as Markdown", add **Download as JSON** (FileJson icon) and **Copy as JSON** buttons that call the new functions.

## Consequences

- Users can download or copy the Documentation page content as JSON, in addition to Markdown.
- Payload is static (no Tauri/browser resolution); same output in both modes.
- Aligns Documentation with the JSON export pattern used on Configuration and App Info.
