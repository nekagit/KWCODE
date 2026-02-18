# ADR 0108 — Project architectures: Download list as JSON

## Status

Accepted.

## Context

The Architecture tab on the project details page lists that project's architectures and offers list-level "Download as Markdown" and "Copy as Markdown", and per-item view with Copy/Download as Markdown. There was no way to export the full visible architecture list as one JSON file, unlike the Design tab, which supports list-level "Download as JSON" in addition to Markdown exports.

## Decision

- Add a shared module `src/lib/download-project-architectures-json.ts` that:
  - Exposes `downloadProjectArchitecturesAsJson(architectures: ArchitectureRecord[])`.
  - Payload: `{ exportedAt: string, count: number, architectures: ArchitectureRecord[] }`.
  - Filename: `project-architectures-{YYYY-MM-DD-HHmm}.json` using `filenameTimestamp` and `triggerFileDownload` from download-helpers.
  - Empty list shows a toast and returns.
- In `ProjectArchitectureTab`, add a "Download as JSON" button in the Export row (when full architecture records are available), operating on the current visible/sorted list (`fullArchitecturesForExport`), before the existing Download as Markdown and Copy as Markdown buttons.

## Consequences

- Users can export all visible project architectures as one JSON file without opening each architecture's view dialog.
- Aligns the Architecture tab with the list-level JSON export pattern used on the Design tab, Ideas, Prompts, and Run history.
