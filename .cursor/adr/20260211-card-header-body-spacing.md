# ADR: Card section header line spacing above first content

## Date
2026-02-11

## Status
Accepted

## Context
The shared `Card` component uses a header with a bottom border (divider line). The body had no top padding, so the first child (e.g. Accordion "Add feature" on the Feature card) sat visually close to the line, making it look like the line was "hitting" the first card.

## Decision
- Add **`pt-4`** to `Card.body` in `shared-classes.json` so there is clear vertical space between the header’s bottom border and the first content block.
- This applies to all cards that use the shared Card (Feature, Run, PromptRecords, etc.).

## Consequences
- Consistent breathing room below section headers across the app.
- No change to header or other Card slots; only body gains top padding.
