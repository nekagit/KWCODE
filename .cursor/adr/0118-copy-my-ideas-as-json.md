# ADR 0118 — Ideas page: Copy as JSON to clipboard

## Status

Accepted.

## Context

The Ideas page ("My ideas") exposes export actions: "Export JSON", "Export MD", "Copy as Markdown", and "Export CSV". Users could download the list as JSON but had no way to copy the same JSON to the clipboard for pasting into scripts or tools without creating a file. This matched a pattern already used on Configuration (app info) and Projects list (Copy as JSON).

## Decision

- In **`src/lib/download-my-ideas.ts`**:
  - Extract a shared payload builder **`buildMyIdeasJsonPayload(ideas)`** used by both download and copy (payload: `{ exportedAt, ideas }`).
  - Add async **`copyMyIdeasAsJsonToClipboard(ideas: IdeaRecord[])`** that builds the same payload, copies pretty-printed JSON via **`copyTextToClipboard`** from `@/lib/copy-to-clipboard`, and shows success or "No ideas to export" / "Failed to copy" toast.
- In **IdeasPageContent**, in the Export row next to "Export JSON", add a **Copy as JSON** button (Copy icon) that calls `copyMyIdeasAsJsonToClipboard(trimmedFilterQuery ? filteredMyIdeas : sortedMyIdeas)` so the copied list respects the current filter when applied.

## Consequences

- Users can copy the ideas list as JSON to the clipboard from the Ideas page without downloading a file.
- Same payload shape as "Export JSON"; only the delivery (clipboard vs file) differs.
- Aligns with existing copy-as-JSON patterns (Configuration app info, Projects list).
