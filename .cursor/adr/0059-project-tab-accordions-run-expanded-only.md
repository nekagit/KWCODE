# ADR 0059: Project tab accordions — Run expanded only

## Status
Accepted (2025-02-17)

## Context
The Project tab showed all sections (Run, Project Files, Project info, Document preview, Design, Architecture, ADR, Agents, Rules) fully expanded, making the page long and requiring scrolling to find the Run section.

## Decision
- Convert all sections in the Project tab into a single collapsible accordion (Radix `Accordion` with `type="single"` and `collapsible`).
- Set `defaultValue="run"` so only the **Run** section is expanded on load.
- All other sections (Project Files, Project info, Document preview, Design, Architecture, ADR, Agents, Rules) are collapsed by default; users expand them as needed.

## Consequences
- Less initial scroll; Run (npm scripts + terminal) is immediately visible.
- Same content and behavior; only the default open state and collapsible UI changed.
- Document preview accordion item is conditionally rendered when `entries.length > 0`.
