# ADR: Rename Stakeholder tab to Setup tab

## Date
2026-02-12

## Status
Accepted

## Context
The first tab on the project details page was labeled "Stakeholder" (value `setup`). The user requested renaming it to "Setup" to better reflect its content (agents, project files, design, ideas, architecture, testing, documentation setup).

## Decision
- **Tab label:** In `ProjectDetailsPageContent.tsx`, the tab config entry for value `setup` was changed from `label: "Stakeholder"` to `label: "Setup"`. The in-code comment for the tab content was updated from "Stakeholder Tab" to "Setup Tab".
- **Copy references:** User-facing text that referred to the "Stakeholder" tab was updated to "Setup tab" in:
  - `DocumentationPageContent.tsx`: description mentioning "Stakeholder tab on a project" → "Setup tab on a project".
  - `ProjectRunTab.tsx`: empty state description "in Stakeholder" → "in Setup".

## Consequences
- The project details page now shows "Setup" as the first tab name; behavior and value (`setup`) are unchanged.
- Documentation and Run tab copy stay consistent with the new tab name.
