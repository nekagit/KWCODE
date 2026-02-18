# ADR 0104 — Project designs: Download list as JSON

## Status

Accepted.

## Context

The Design tab on the project details page lists that project's designs and offers list-level "Download as Markdown" and "Copy as Markdown", and per-item "Download as Markdown" and "Download as JSON". There was no way to export the full visible design list as one JSON file, unlike Ideas, Prompts, and Run history, which support list-level "Export JSON".

## Decision

- Add a shared module `src/lib/download-project-designs-json.ts` that:
  - Exposes `downloadProjectDesignsAsJson(designs: DesignRecord[])`.
  - Payload: `{ exportedAt: string, count: number, designs: DesignRecord[] }`.
  - Filename: `project-designs-{YYYY-MM-DD-HHmm}.json` using `filenameTimestamp` and `triggerFileDownload` from download-helpers.
  - Empty list shows a toast and returns.
- In `ProjectDesignTab`, add a "Download as JSON" button in the Export row that operates on the current visible/sorted list (`sortedDesigns`).

## Consequences

- Users can export all visible project designs as one JSON file without opening each design's actions.
- Aligns the Design tab with the list-level JSON export pattern used on Ideas, Prompts, and Run history.
