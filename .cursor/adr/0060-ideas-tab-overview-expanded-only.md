# ADR 0060: Ideas tab — overview expanded only

## Status
Accepted (2025-02-17)

## Context
The Ideas tab (project Ideas tab and ideas.md accordion) had multiple sections expanded by default (e.g. section-preamble, section-0, section-1, section-2, or first four structured sections), making the page long and noisy.

## Decision
- **ProjectIdeasDocTab**: Initial `expandedSections` is now only `["section-preamble"]` (the "Overview" section from structured ideas.md). For legacy non-structured content, "Context & vision" (intro) is expanded by default (`introExpanded: true`).
- **IdeasDocAccordion**: For structured docs, `defaultValue` is only the overview when present (`["section-preamble"]`), otherwise the first section; for the flat intro+ideas fallback, `defaultValue={["intro"]}` so only "Context & vision" is expanded.

## Consequences
- Only the overview/context section is expanded on load; all other sections (idea lists, etc.) are collapsed.
- Same content and behavior; users expand other sections as needed.
