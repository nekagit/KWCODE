# 0008-remove-project-tabs.md

## Title
Remove Project Tabs Component

## Status
Accepted

## Context
The application currently uses a tab bar (`ProjectTabs` component) for navigation within project details pages, displaying various categories such as Design, Ideas, Features, Tickets, Prompts, and Architecture. The user has requested to remove this top tab bar from the UI.

## Decision
The `ProjectTabs` component, located at `src/components/molecules/LayoutAndNavigation/ProjectTabs.tsx`, will be removed. The individual tab content components (e.g., `ProjectDesignTab`, `ProjectIdeasTab`, etc.) will be rendered directly within `src/components/organisms/ProjectDetailsPageContent.tsx`, eliminating the need for tab-based navigation. This simplifies the UI and removes a layer of abstraction for displaying project-related content.

## Consequences
*   **Simplified UI**: The top tab bar will no longer be present, making the project details page more streamlined.
*   **Direct Content Rendering**: All project-related content (Design, Ideas, Features, etc.) will be rendered directly on the `ProjectDetailsPageContent` without conditional rendering based on an `activeTab` state.
*   **Code Removal**: The `ProjectTabs.tsx` file and related import/state management in `ProjectDetailsPageContent.tsx` have been removed.
*   **Navigation Change**: Users will no longer be able to navigate between project categories using the tab bar. Further changes might be needed to provide an alternative navigation method if required by the user.

## Alternative Considered
*   **Hiding the tab bar with CSS**: This was considered but rejected because it would leave the underlying component and its logic in place, adding unnecessary complexity and code that is no longer used.
*   **Replacing with a different navigation component**: This was considered but rejected as the user specifically requested to remove the tab bar, implying a simpler, non-tabbed layout for the project details.
