# ADR 054: Feature tab – Delete all button

## Status

Accepted.

## Context

The Feature tab (dashboard) lists features with per-item delete (trash icon). Users need a way to clear all features at once (e.g. after seeding a template or for a fresh start).

## Decision

- **Delete all handler**: Add `deleteAllFeatures` in `src/app/page.tsx` that:
  - Returns early if `features.length === 0`.
  - Asks for confirmation via `confirm()` with message: "Delete all N feature(s)? This cannot be undone."
  - On confirm: calls `saveFeatures([])`, then `clearFeatureQueue()`, then shows toast "All features deleted".
- **UI**: Add a "Delete all" button in the Feature tab toolbar row (next to "Filter by project"):
  - `variant="destructive"`, `size="sm"`, icon `Trash2`.
  - Shown only when `features.length > 0`.
- **Consistency**: Follow existing destructive-action pattern (confirm + toast) used on prompts, projects, design, ideas, and architecture pages.

## Consequences

- Users can clear all features in one action with a single confirmation.
- Feature queue is cleared when deleting all features to avoid stale queue references.
- No new dependencies; reuses existing save/clear and toast APIs.
