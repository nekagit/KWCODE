# ADR 0119 — Project architectures: Copy as JSON to clipboard

## Status

Accepted.

## Context

The Architecture tab on the project details page has "Download as JSON", "Download as Markdown", and "Copy as Markdown" for the visible architecture list. There was no way to copy the same list as JSON to the clipboard, unlike the Projects list and Ideas page, which offer both Download as JSON and Copy as JSON. Users who want to paste the list into scripts or support tools without creating a file had no clipboard JSON option.

## Decision

- In **`src/lib/download-project-architectures-json.ts`**:
  - Extract a shared **`buildProjectArchitecturesJsonPayload(architectures)`** used by both download and the new copy function (payload: `{ exportedAt, count, architectures }`).
  - Add async **`copyProjectArchitecturesAsJsonToClipboard(architectures: ArchitectureRecord[])`** that builds the same payload, copies pretty-printed JSON via `copyTextToClipboard`, and shows success or "No architectures to export" / "Failed to copy to clipboard" toast.
- In **ProjectArchitectureTab**, in the Export row next to "Download as JSON", add a **Copy as JSON** button (Copy icon) that calls `copyProjectArchitecturesAsJsonToClipboard(fullArchitecturesForExport)` so the copied list respects current filter and sort.

## Consequences

- Users can copy the project architectures list as JSON to the clipboard from the Architecture tab without downloading a file.
- Same payload shape as "Download as JSON"; only the delivery (clipboard vs file) differs.
- Aligns with existing copy-as-JSON patterns (Projects list, Ideas, Configuration app info).
