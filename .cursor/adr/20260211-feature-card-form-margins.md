# ADR: Feature card and Add feature form margins

## Date
2026-02-11

## Status
Accepted

## Context
The Feature card (FEATURE title, subtitle, Add feature accordion, TITLE, TICKETS, PROMPTRECORDS, PROJECTS, and list) had insufficient vertical spacing. Cards and text felt cramped with minimal margins between sections, reducing readability and visual hierarchy.

## Decision
- **FeatureAddForm**: Increased section spacing from `gap-2` to `gap-5` and top padding from `pt-1` to `pt-3` so TITLE, each CheckboxGroup, and the Add feature button have clear separation.
- **CheckboxGroup** (shared-classes): Increased root spacing from `gap-3` to `gap-4` so the label and scroll area have slightly more breathing room.
- **Accordion** (shared-classes): Increased accordion content top padding from `pt-2` to `pt-4` so content is not flush with the "Add feature" header.
- **FeatureManagementCard**: Wrapped the Accordion in a `div` with `mb-4` so there is clear space between the Add feature accordion and the filter/actions row below.

## Consequences
- Feature form sections are easier to scan and use.
- Shared CheckboxGroup and Accordion spacing improvements apply everywhere these components are used.
- No breaking API or behavior changes; layout only.
