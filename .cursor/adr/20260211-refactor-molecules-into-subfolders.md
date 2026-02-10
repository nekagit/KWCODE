
# 20260211-refactor-molecules-into-subfolders

## Status
Proposed

## Context
The `src/components/molecules` directory currently contains a large number of individual component folders, leading to a flat and unmanageable structure. This makes it difficult to navigate, locate, and understand the purpose of different components. The lack of logical grouping increases cognitive load for developers and can hinder maintainability and scalability.

## Decision
To improve the organization and maintainability of the `src/components/molecules` directory, we will refactor the existing component folders into logical subfolders based on their functionality and purpose. The proposed grouping is as follows:

*   **Forms & Dialogs:** Components related to forms, input, and dialogs.
    *   `AddTicketAccordion`
    *   `ArchitectureEditDialog`
    *   `ArchitectureViewDialog`
    *   `ExportContentDialog`
    *   `GeneratePromptDialog`
    *   `IdeaFormDialog`
    *   `NewProjectForm`
    *   `PromptFormDialog`
    *   `ProjectForm`

*   **Cards & Display:** Components primarily used for displaying information in card-like formats or as distinct display elements.
    *   `AiGeneratedArchitecturesCard`
    *   `AiGeneratedIdeasCard`
    *   `ArchitectureTemplateCard`
    *   `CoverageMetricCard`
    *   `CuratedPracticesCard`
    *   `FeatureManagementCard`
    *   `IdeaTemplateCard`
    *   `LocalProjectsCard`
    *   `MyDefinitionsCard`
    *   `MyIdeasCard`
    *   `MyTestPracticesCard`
    *   `NoProjectsFoundCard`
    *   `ProjectCard`
    *   `ProjectSelectionCard`
    *   `PromptSelectionCard`
    *   `PromptsAndTimingCard`
    *   `QuickActionCard`
    *   `RunFromFeatureCard`
    *   `RunLabelCard`
    *   `TestGenerationCard`
    *   `TestingPhasesCard`
    *   `ThemePreviewCard`
    *   `TicketCard`
    *   `TicketManagementCard`

*   **Tab & Content Sections:** Components that represent the content within tabs or distinct sections of a page.
    *   `AiGeneratedArchitecturesTabContent`
    *   `AllDataTabContent`
    *   `ArchitectureTemplatesTabContent`
    *   `DashboardTabContent`
    *   `DbDataTabContent`
    *   `FeatureTabContent`
    *   `LogTabContent`
    *   `MyDefinitionsTabContent`
    *   `ProjectArchitectureTab`
    *   `ProjectDesignTab`
    *   `ProjectFeaturesTab`
    *   `ProjectIdeasTab`
    *   `ProjectPromptsTab`
    *   `ProjectTicketsTab`
    *   `ProjectsTabContent`
    *   `PromptsTabContent`
    *   `TicketsTabContent`

*   **Layout & Navigation:** Components responsible for page layout, headers, and navigation elements.
    *   `NavigationTabs`
    *   `PageHeader`
    *   `ProjectHeader`
    *   `ProjectsHeader`
    *   `RunPageHeader`
    *   `ThemedPageLayout`
    *   `TicketBoardLayout`
    *   `ProjectTabs`

*   **Lists & Tables:** Components that render lists or tabular data.
    *   `PromptCheckboxList`
    *   `PromptTable`
    *   `TestTemplateList`
    *   `TicketsDisplayTable`
    *   `ProjectListContainer`

*   **Controls & Buttons:** Interactive elements like buttons or control groups.
    *   `PromptActionButtons`
    *   `QuickActionButtons`
    *   `RunControls`

*   **Dashboards & Specific Views:** Components representing entire dashboards or highly specific views.
    *   `CoverageDashboard`

*   **Utilities & Helpers:** Smaller, more generic components that provide utility or assist in specific functionalities.
    *   `ErrorDisplay`
    *   `ProjectLoadingState`
    *   `ProjectNotFoundState`
    *   `ThemeSelector`
    *   `EditProjectHeader`
    *   `NewProjectHeader`
    *   `TemplateIdeaAccordion`

## Consequences
*   **Positive:**
    *   Improved code organization and readability.
    *   Easier navigation and discovery of related components.
    *   Reduced cognitive load for developers.
    *   Better maintainability and scalability of the component library.
*   **Negative:**
    *   Requires moving existing files and updating all import paths across the codebase. This will be a significant refactoring effort.
    *   Potential for temporary breakage during the refactoring process if not handled carefully.
