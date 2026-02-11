# 00XX-refactor-display-components-to-atomic-design

## Status

Proposed

## Context

Existing components in `src/components/atoms/displays` were found to be more complex than typical "atoms" as defined by Atomic Design principles. These components often contained significant logic, multiple sub-components, or were responsible for displaying structured data, making them better suited for "molecules" or "organisms" classification. Additionally, there was a duplication of functionality between `GeneratedPromptDisplay.tsx` and `GeneratedPromptRecordDisplay.tsx`.

## Decision

To align with Atomic Design principles and improve component organization, the following decisions were made:

1.  **Reclassification and Relocation:**
    *   Components that exhibited characteristics of molecules (e.g., combining atoms into functional groups, containing some logic) were moved to `src/components/molecules/Displays` or `src/components/molecules/CardsAndDisplay`.
    *   Components that were more complex and represented larger, self-contained sections of the UI (e.g., entire Kanban columns) were moved to `src/components/organisms/Display`.
    *   `GlassCard.tsx` was reclassified as a visual effect atom and moved to `src/components/atoms/VisualEffects`.
    *   `PageFooterText.tsx` was reclassified as a navigation molecule and moved to `src/components/molecules/Navigation`.
    *   `CodeBlock.tsx` was deemed to be a true atom and remained in `src/components/atoms/displays`.

2.  **Consolidation of Duplicate Components:**
    *   `GeneratedPromptDisplay.tsx` and `GeneratedPromptRecordDisplay.tsx`, being identical in functionality and structure, were consolidated into a single shared component: `src/components/molecules/FormsAndDialogs/GeneratedContentForm.tsx`. The original duplicate files were then deleted.

3.  **Update Import Paths:**
    *   All files importing the relocated or consolidated components have had their import paths updated to reflect the new file locations.

## Consequences

*   **Improved Code Organization:** The component structure now more accurately reflects Atomic Design principles, making the codebase easier to understand, navigate, and maintain.
*   **Reduced Duplication:** Consolidating `GeneratedPromptDisplay` and `GeneratedPromptRecordDisplay` eliminates redundant code, simplifying maintenance and reducing bundle size.
*   **Enhanced Reusability:** Grouping components by their atomic classification (atoms, molecules, organisms) promotes better reusability and consistency across the application.
*   **Potential for Future Refinements:** This refactoring lays the groundwork for further adherence to Atomic Design, allowing for clearer identification of atoms, molecules, and organisms as the project evolves.

## Action Items

*   [x] Create new directories: `src/components/molecules/Displays`, `src/components/organisms/Display`, `src/components/molecules/CardsAndDisplay`, `src/components/atoms/VisualEffects`, `src/components/molecules/Navigation`, `src/components/molecules/FormsAndDialogs`.
*   [x] Move display-related components to `src/components/molecules/Displays`.
*   [x] Move `ProjectTicketsKanbanColumn.tsx` to `src/components/organisms/Display`.
*   [x] Move `TemplateIdeaCard.tsx` to `src/components/molecules/CardsAndDisplay`.
*   [x] Move `GlassCard.tsx` to `src/components/atoms/VisualEffects`.
*   [x] Move `PageFooterText.tsx` to `src/components/molecules/Navigation`.
*   [x] Create `src/components/molecules/FormsAndDialogs/GeneratedContentForm.tsx` by consolidating `GeneratedPromptDisplay.tsx` and `GeneratedPromptRecordDisplay.tsx`.
*   [x] Delete `src/components/molecules/Displays/GeneratedPromptDisplay.tsx` and `src/components/molecules/Displays/GeneratedPromptRecordDisplay.tsx`.
*   [x] Update all import paths in affected files.