# ADR: Testing card in Stakeholder tab

## Date
2026-02-11

## Status
Accepted

## Context
The Stakeholder tab (value `"setup"`) on the project details page showed Design, Ideas, and Architecture in separate cards. Stakeholders need a single entry point for testing (templates, practices, phases, coverage) per project.

## Decision
- **New card "Testing"** added in the Stakeholder tab, after the Architecture card.
- **New component `ProjectTestingTab`** (`TabAndContentSections/ProjectTestingTab.tsx`):
  - Uses `ProjectCategoryHeader` with title "Testing" and `TestTube2` icon.
  - Renders an `EmptyState` with title "Testing hub", description about managing test templates, practices, phases, and coverage.
  - Primary action: "Open testing" button linking to `/testing?projectId={projectId}`.
- **Organism**: `ProjectDetailsPageContent` imports `ProjectTestingTab` and renders it inside a fourth `Card` with `CardContent` class `c["19"]`.
- **Styling**: `tailwind-molecules.json` and `tailwind-organisms.json` updated with classes for `ProjectTestingTab` and the new card content (`"19": "pt-8 pb-8 px-6"`).

## Consequences
- Stakeholder tab now has four sections: Design, Ideas, Architecture, Testing.
- Testing is discoverable from the project details page without using the global sidebar.
- Testing card follows the same pattern as Design/Ideas/Architecture (header + empty state with CTA to dedicated page).
