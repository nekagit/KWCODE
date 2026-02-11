# 0001-restructure-molecules-folder.md

## Status
Accepted

## Context

Existing UI components within the `src/components/molecules` directory lacked consistency in their structure and design, leading to reduced reusability and increased maintenance overhead. Many components duplicated similar layout patterns, and there was no clear separation of concerns between presentational and container components.

The primary goal of this refactoring was to establish a more robust and scalable component architecture, aligning with Atomic Design principles, to improve consistency, reusability, and maintainability across the application.

## Decision

We decided to refactor the `src/components/molecules` directory into a more structured approach, introducing `src/components/shared` for generic layout components and `src/components/atoms` for the smallest reusable UI elements. The existing molecule components were then refactored to compose these new shared and atom components.

### Key Architectural Changes:

1.  **Introduction of `src/components/shared`:**
    *   **Purpose:** To house generic, reusable layout components that provide consistent structural and stylistic patterns across the application. These components are designed to be highly configurable via props but without specific business logic.
    *   **Components Created:**
        *   `Card.tsx`: Provides a consistent card layout with optional `title`, `subtitle`, and `footerButtons` (using `ButtonGroup`).
        *   `Form.tsx`: A wrapper for forms, ensuring consistent styling and structure.
        *   `Dialog.tsx`: A reusable dialog wrapper, abstracting Shadcn UI's `Dialog` components.
        *   `Tabs.tsx`: A wrapper for tab navigation, abstracting Shadcn UI's `Tabs` components.
        *   `List.tsx`: For displaying lists of items.
        *   `Table.tsx`: For consistent table layouts.
        *   `ButtonGroup.tsx`: A flexible container for grouping buttons with alignment options.
        *   `PageHeader.tsx`: For consistent page titles and descriptions.
        *   `Accordion.tsx`: Reusable accordion component.
        *   `EmptyState.tsx`: For displaying messages when no data is available.
        *   `LoadingState.tsx`: For displaying loading indicators.
        *   `ErrorDisplay.tsx`: For consistent error message presentation.
        *   `GridContainer.tsx`: For consistent grid layouts.

2.  **Introduction of `src/components/atoms`:**
    *   **Purpose:** To define the smallest, indivisible UI elements that perform a single, atomic function. These are pure, presentational components.
    *   **Examples of Atoms Created/Refactored:**
        *   `TitleWithIcon.tsx`, `PriorityBadge.tsx`, `ProjectCheckboxItem.tsx`, `PromptCheckboxItem.tsx`, `FeatureInput.tsx`, `TicketCheckboxGroup.tsx`, `PromptCheckboxGroup.tsx`, `ProjectCheckboxGroup.tsx`, `FeatureAddForm.tsx`, `FeatureQueueActions.tsx`, `FeatureFilterSelect.tsx`, `FeatureListItem.tsx`, `LocalProjectListItem.tsx`, `IdeaListItem.tsx`, `AiGeneratorInput.tsx`, `AiIdeaListItem.tsx`, `TemplateIdeaListItem.tsx`, `DefinitionCategorySelect.tsx`, `DefinitionListItem.tsx`, `ArchitectureGeneratorInput.tsx`, `AiArchitectureListItem.tsx`, `TestingPhaseListItem.tsx`, `CuratedPracticeListItem.tsx`, `ThemeNameHeader.tsx`, `ThemeColorSwatches.tsx`, `ThemeIconPreview.tsx`, `ThemeButtonPreview.tsx`, `TicketFormFields.tsx`, `ProjectInput.tsx`, `ProjectTextarea.tsx`, `ProjectPromptCheckboxGroup.tsx`, `ProjectTicketCheckboxGroup.tsx`, `ProjectFeatureCheckboxGroup.tsx`, `ProjectIdeaCheckboxGroup.tsx`, `ProjectDesignCheckboxGroup.tsx`, `ProjectArchitectureCheckboxGroup.tsx`, `IdeaFormFields.tsx`, `ArchitectureDetailsDisplay.tsx`, `ArchitectureEditForm.tsx`, `PromptGeneratorForm.tsx`, `GeneratedPromptDisplay.tsx`, `PromptFormFields.tsx`, `PromptTableRow.tsx`, `TestTemplateListItem.tsx`, `AddTicketButton.tsx`, `RunFeatureButton.tsx`, `PromptsButton.tsx`, `ActiveReposButton.tsx`, `FeaturesButton.tsx`, `ViewLogButton.tsx`, `StartButton.tsx`, `StopButton.tsx`, `PageFooterText.tsx`, `CreatePromptButton.tsx`, `EditPromptButton.tsx`, `GeneratePromptWithAiButton.tsx`, `ProjectArchitectureHeader.tsx`, `ProjectArchitectureListItem.tsx`, `AllProjectsDisplayList.tsx`, `PromptsDisplayList.tsx`, `TicketsDisplayList.tsx`, `FeaturesDisplayList.tsx`, `IdeasDisplayList.tsx`, `ProjectPromptHeader.tsx`, `ProjectPromptListItem.tsx`, `ProjectTicketsHeader.tsx`, `ProjectTicketsKanbanColumn.tsx`, `GenerateKanbanPromptSection.tsx`, `ProjectFeatureHeader.tsx`, `ProjectFeatureListItem.tsx`, `ProjectIdeaHeader.tsx`, `ProjectIdeaListItem.tsx`, `ProjectDesignHeader.tsx`, `ProjectDesignListItem.tsx`, `CodeBlock.tsx`.

3.  **Refactoring of `src/components/molecules`:**
    *   Existing components in `src/components/molecules` were refactored to consume the new `shared` components for their layout and structure, and `atoms` for their granular UI elements. This significantly reduced duplication and improved the clarity and testability of these molecule components.

## Consequences

### Positive:

*   **Improved Consistency:** All major UI components now adhere to a consistent design language and structure, enhancing the overall user experience.
*   **Increased Reusability:** The introduction of shared and atom components allows for easier reuse of UI elements across different parts of the application, reducing development time and effort.
*   **Enhanced Maintainability:** The clear separation of concerns makes the codebase easier to understand, debug, and modify. Changes to core UI elements can be made in one place and propagate consistently.
*   **Better Scalability:** The modular architecture facilitates the addition of new features and components without introducing significant technical debt.
*   **Clearer Development Guidelines:** The defined component hierarchy provides a clear mental model for developers when building new UI components.

### Negative:

*   **Initial Refactoring Effort:** The process required a significant upfront effort to identify, extract, and refactor existing components. While beneficial in the long run, it required dedicated development time.
*   **Increased File Count:** The creation of numerous atom components has led to an increase in the total number of files in the codebase, which might slightly increase navigation complexity for developers unfamiliar with the structure.

## Next Steps

*   Continue to enforce the new component architecture for all new UI development.
*   Periodically review the `shared` and `atoms` directories to identify opportunities for further generalization or optimization.
*   Document the usage guidelines for new shared components in the project's internal documentation.
