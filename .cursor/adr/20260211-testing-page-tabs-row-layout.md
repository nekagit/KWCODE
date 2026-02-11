# ADR: Testing page tabs row layout

## Date
2026-02-11

## Status
Accepted

## Context
On the Testing page, the tab bar (Templates, Best practices, Phases, Coverage) was rendering as a column instead of a horizontal row, hurting usability and consistency with other tab layouts in the app.

## Decision
- Updated the `TabsList` layout for `TestingPageContent` in `tailwind-organisms.json` (key `"3"`).
- Replaced `grid w-full max-w-2xl grid-cols-4` with `flex flex-row flex-wrap items-center justify-start gap-2 w-full max-w-2xl` so the tab triggers are explicitly laid out in a row.
- Kept `flex-wrap` so tabs can wrap on very small viewports instead of overflowing.

## Consequences
- Testing page tabs display in a single horizontal row.
- Layout is consistent with other tab pages (e.g. Project details, ThreeTabLayout).
- No component code changes; only organism Tailwind class mapping was updated.
