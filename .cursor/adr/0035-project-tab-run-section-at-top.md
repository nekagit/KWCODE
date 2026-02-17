# ADR 0035: Project tab — Run section at top

## Status

Accepted.

## Context

In the Project tab (project details), the Run section (scripts from package.json, Play, terminal output) was placed after Project Files, Project info, and Document preview. Users want quick access to run the app; placing Run at the top improves discoverability and reduces scrolling.

## Decision

- **Run section first:** In the Project tab content, render the Run section as the first section, before Project Files, Project info, Document preview, Ideas, ADR, Agents, and Rules.

## Implementation

- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx`: Reordered sections so the Run `SectionCard` (emerald) is the first child inside the scrollable content (`space-y-6 pr-4`). No logic or props changed; only DOM order.

## Consequences

- Run (scripts + terminal) is immediately visible when opening the Project tab.
- Project Files and Project info follow below; layout and behavior unchanged.
