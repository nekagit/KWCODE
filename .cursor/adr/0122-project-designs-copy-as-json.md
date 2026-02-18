# ADR 0122 — Project designs: Copy as JSON to clipboard

## Status

Accepted.

## Context

The Design tab on the project details page has "Download as JSON", "Copy as Markdown", and "Download as Markdown" for the visible design list. There was no way to copy the same list as JSON to the clipboard, unlike the Architecture tab and Ideas page, which offer both Download as JSON and Copy as JSON. Users who want to paste the list into scripts or support tools without creating a file had no clipboard JSON option.

## Decision

- In **`src/lib/download-project-designs-json.ts`**:
  - Extract a shared **`buildProjectDesignsJsonPayload(designs)`** used by both download and the new copy function (payload: `{ exportedAt, count, designs }`).
  - Add async **`copyProjectDesignsAsJsonToClipboard(designs: DesignRecord[])`** that builds the same payload, copies pretty-printed JSON via `copyTextToClipboard`, and shows success or "No designs to export" / "Failed to copy to clipboard" toast.
- In **ProjectDesignTab**, in the Export row next to "Download as JSON", add a **Copy as JSON** button (Copy icon) that calls `copyProjectDesignsAsJsonToClipboard(sortedDesigns)` so the copied list respects current filter and sort.

## Consequences

- Users can copy the project designs list as JSON to the clipboard from the Design tab without downloading a file.
- Same payload shape as "Download as JSON"; only the delivery (clipboard vs file) differs.
- Aligns with existing copy-as-JSON patterns (Project architectures, Ideas, Projects list, Configuration app info).
