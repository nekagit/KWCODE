# 0017 - Refactor List Items to Atomic Design

## Status

Proposed

## Context

The `src/components/atoms/list-items` directory contains numerous components that serve similar purposes: displaying an item with a title, description, category badge, and various action buttons. While these are currently classified as "atoms," their internal structure often includes elements that could be further broken down or standardized. This leads to duplication of styling and structural patterns across different list item components.

## Decision

To enhance maintainability, consistency, and reusability, we will refactor the list item components in `src/components/atoms/list-items` to adhere more strictly to atomic design principles.

The core of this refactoring will involve:

1.  **Introducing a `ListItemCard` Component:** Create a new shared component, `ListItemCard`, which will encapsulate the common layout for a list item. This component will handle the rendering of a title, subtitle (description), an optional badge, and a flexible slot for action buttons or other custom content. It will leverage the existing `@/components/ui/card` for its base styling.

2.  **Standardizing Action Button Groups:** Where multiple action buttons are present, they will utilize the existing `@/components/shared/ButtonGroup` component for consistent alignment and spacing. Individual action buttons will be simple `Button` components from `@/components/ui/button` with appropriate icons and labels.

3.  **Consistent Badge Usage:** Ensure that all category or status indicators are rendered using the `@/components/ui/badge` component, with consistent styling (e.g., `variant="secondary"`).

4.  **Refactoring Existing List Items:** Each existing list item component will be refactored to consume the new `ListItemCard` component, passing its specific data and actions as props. This will significantly reduce the amount of redundant markup and styling in each individual list item.

## Consequences

*   **Improved Code Reusability:** The `ListItemCard` component will be reusable across all list item types, reducing code duplication.
*   **Enhanced Consistency:** A standardized look and feel for list items will be achieved throughout the application.
*   **Easier Maintenance:** Changes to the basic structure or styling of list items will only need to be applied in one place (`ListItemCard`), rather than across multiple files.
*   **Clearer Component Hierarchy:** The distinction between atomic `Button`, `Badge`, and `Card` components, and the more complex `ListItemCard` (a molecule), will be clearer.
*   **Potential for Performance Improvements:** By reducing redundant JSX and styles, there might be minor performance gains.
*   **Increased Initial Effort:** The refactoring process will require an initial time investment to create the `ListItemCard` and update all existing list items.
