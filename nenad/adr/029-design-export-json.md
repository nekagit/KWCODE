# ADR 029: Design page – export designs as JSON

## Status

Accepted.

## Context

Designs are configured on the Design page (template, colors, typography, layout, sections). The app already exports design specs as Markdown (.md). Users need to export the same design config as JSON for tooling, version control, or reuse in other systems.

## Decision

- **JSON export on Design page**
  - Add a third tab **JSON** next to **Preview** and **Generated .md**.
  - The JSON tab shows the current `DesignConfig` as pretty-printed JSON (2-space indent).
  - **Copy** copies the JSON to the clipboard.
  - **Download** downloads a `.json` file named `design-{templateId}-{pageTitle}.json`.
- **Data included**
  - Full `DesignConfig`: `projectName`, `templateId`, `pageTitle`, `colors`, `typography`, `layout`, `sections`, `notes`. No transformation; same shape as in-memory config.

## Consequences

- Users can export designs as JSON alongside Markdown.
- JSON is suitable for automation, backups, and re-import (future work).
- Implementation is minimal: `designJson = JSON.stringify(config, null, 2)`, plus Copy/Download handlers and a read-only textarea in the JSON tab.
