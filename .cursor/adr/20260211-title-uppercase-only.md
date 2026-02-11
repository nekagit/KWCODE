# ADR: Title uppercase only, body text normal

## Date
2026-02-11

## Status
Accepted

## Context
UI should have a clear hierarchy: only titles in uppercase (caps), all other text (subtitles, body, descriptions) in normal casing.

## Decision
- **Add `uppercase` to all shared title class strings** in `src/components/shared/shared-classes.json` for: `Card.title`, `Dialog.title`, `EmptyState.title`, `ErrorDisplay.title`, `Header.title`, `ProjectHeader.title`, `ListItemCard.title`, `PageHeader.title`.
- **Leave subtitle and body classes unchanged** (no uppercase) so only the title is visually emphasized as caps.

## Consequences
- Titles render in all caps across cards, dialogs, headers, empty states, and list item cards.
- Subtitles, descriptions, and body text remain in normal case for readability.
- Single place to revert or adjust: `shared-classes.json`.
