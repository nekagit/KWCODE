# ADR 045: Features page – show all features, Tauri sync with features.json

## Status

Accepted.

## Context

Users reported not seeing all created features on the Feature tab (Dashboard → Feature). Causes:

1. **Tauri vs JSON**: In Tauri, features were read from SQLite. The DB is only seeded from `data/features.json` when the DB is empty. Features added later (e.g. via seed template or editing the JSON) never appeared in the app when using Tauri.
2. **UI**: The Feature tab used a short fixed-height scroll area (280px) and did not show total count, so it was unclear how many features existed and that the list was scrollable.

Browser mode already loaded all features from `GET /api/data` (which reads `data/features.json`) with no limit.

## Decision

- **Tauri `get_features`**: Prefer `data/features.json` when the file exists: read and return it. Otherwise fall back to SQLite. This aligns Tauri with the browser and ensures the file is the source of truth when present.
- **Tauri `save_features`**: After writing to the DB, also write the same list to `data/features.json` so the file stays in sync and browser/Tauri see the same data.
- **Dashboard Feature tab**: Show total count in the card title (e.g. "Feature (328)"). Increase the feature list height from 280px to `min-h-[280px] h-[60vh]` so more items are visible and scrolling is obvious. Add hint in description: "Scroll to see all."

## Consequences

- All created features are visible in both browser and Tauri when `data/features.json` exists.
- Tauri and browser stay in sync: saves from Tauri update the JSON; both read from the same file when available.
- Users see how many features exist and can scroll a larger area to find them.
