# ADR: Stakeholder tab – Documentation section

## Date
2026-02-12

## Status
Accepted

## Context
The Stakeholder tab on the project details page already had sections for Project Files, Design, Ideas, Architecture, and Testing. The user requested a section “like testing but called documentation” to support project-level documentation (docs, ADRs, etc.) in the same tab.

## Decision
- **New section in Stakeholder tab:** A “Documentation” section was added, implemented as a card similar to the Testing card.
- **Component:** `ProjectDocumentationTab` was added under `src/components/molecules/TabAndContentSections/ProjectDocumentationTab.tsx`, mirroring `ProjectTestingTab` (same layout: `ProjectCategoryHeader` with title “Documentation” and icon `FileText`, plus an `EmptyState` with “Documentation hub”, short description, and an “Open documentation” button).
- **Stakeholder layout:** In `ProjectDetailsPageContent`, the Documentation section is rendered inside a `SectionCard` with `accentColor="teal"`, placed after the Testing section in the same grid.
- **Route:** A minimal `/documentation` page was added so the “Open documentation” link (with optional `?projectId=...`) resolves. The page renders `DocumentationPageContent` (header and description only; content can be extended later).
- **Styling:** Tailwind classes for `ProjectDocumentationTab` were added to `tailwind-molecules.json`; organism classes for `DocumentationPageContent` were added to `tailwind-organisms.json`.

## Consequences
- Stakeholder tab now offers a dedicated Documentation entry point alongside Testing, Design, Ideas, and Architecture.
- “Open documentation” navigates to `/documentation` (with optional projectId for future project-scoped docs).
- Documentation hub content and project-scoped behavior can be implemented later without changing the tab structure.
