# 0005-typescript-errors-fix

## Status

Accepted

## Context

This ADR addresses a large number of TypeScript build errors (`tsc --noEmit`) that were preventing the project from compiling correctly. The errors were primarily related to:

- **Missing exports and incorrect imports**: `Ticket` was being imported from `@/types/ticket` but was not exported. The correct type was `TicketRow`. Similarly, `ProjectHeader` was being imported from `@/components/shared/ProjectHeader` which did not exist, and `GenerateKanbanPromptRecordSection` was incorrectly used with `kanbanPromptRecord` props instead of `kanbanPrompt`.
- **Duplicate components**: There were two `TitleWithIcon.tsx` components, causing confusion and potential issues.
- **Missing components**: `LabeledInput` and `FieldWrapper` were imported but their corresponding files did not exist.
- **Incorrect React usage**: `React` was used without explicit import in `ProjectListContainer.tsx`.
- **Type mismatches**: `PageHeader` expected a string title but received a ReactNode, and `Card` components were missing required `children` props.

## Decision

The following decisions were made to resolve the TypeScript errors:

1.  **Standardize Ticket Type**: All imports of `Ticket` from `@/types/ticket` were changed to `TicketRow`. This involved updating various component files (`FeatureAddForm.tsx`, `AllDataTabContent.tsx`, `DbDataTabContent.tsx`, `FeatureTabContent.tsx`, `TicketsTabContent.tsx`, `DashboardTabContent.tsx`, `TicketsDisplayList.tsx`, `FeatureManagementCard.tsx`, `TicketManagementCard.tsx`, `TicketsDisplay.tsx`, `FeatureActions.tsx`).
2.  **Consolidate TitleWithIcon**: The duplicate `src/components/atoms/headers/TitleWithIcon.tsx` was updated with the content of `src/components/shared/TitleWithIcon.tsx`, and then `src/components/shared/TitleWithIcon.tsx` was deleted to ensure a single source of truth for the component.
3.  **Replace Missing Input Components**: 
    - `src/components/atoms/inputs/ProjectInput.tsx` was refactored to directly use `GenericInputWithLabel` instead of the non-existent `LabeledInput`.
    - The import and usage of `FieldWrapper` in `src/components/shared/LabeledTextarea.tsx` were removed as `FormField` already provided the necessary wrapping functionality.
4.  **Fix React Import**: `import React from 'react';` was added to `src/components/molecules/ListsAndTables/ProjectListContainer.tsx` to resolve the UMD global error.
5.  **Address Card Children Prop**: `Card` components in `ProjectArchitectureListItem.tsx` and `ProjectPromptListItem.tsx` were updated to explicitly include an empty `<></>` fragment as children to satisfy the `children` prop requirement.
6.  **Correct TicketStatus Import**: Imports of `TicketStatus` in `StatusBadge.tsx` and `TicketStatusUpdater.tsx` were changed to import from `@/types/ticket` instead of `@/components/tickets-data-table`.
7.  **Update PageHeader Type Definition**: `PageHeader` in `src/components/molecules/LayoutAndNavigation/PageHeader.tsx` was modified to accept `React.ReactNode` for its `title` prop and an optional `icon` prop, allowing `ProjectCategoryHeader` to pass its icon correctly.
8.  **Rename and Consolidate Project Header Components**: `ProjectHeader` from `shared` was replaced with `ProjectCategoryHeader` in `ProjectDesignTab.tsx`, `ProjectFeaturesTab.tsx`, `ProjectIdeasTab.tsx`, `ProjectPromptsTab.tsx`, and `ProjectTicketsTab.tsx`. The relevant imports and component usages were updated to point to the correct `ProjectCategoryHeader` component.
9.  **Correct GenerateKanbanPromptSection Usage**: In `ProjectTicketsTab.tsx`, the state variables `kanbanPromptRecord` and `kanbanPromptRecordLoading`, and the function `generateKanbanPromptRecord` were renamed to `kanbanPrompt`, `kanbanPromptLoading`, and `generateKanbanPrompt` respectively, to match the props expected by `GenerateKanbanPromptSection`.

## Consequences

- The project now compiles without TypeScript errors, ensuring a stable development environment.
- Code consistency is improved by centralizing components like `TitleWithIcon` and `ProjectCategoryHeader`.
- The codebase is more maintainable due to corrected imports and type definitions.
