# 0002-unify-project-category-headers.md

## Title: Unify Project Category Headers

## Status: Accepted

## Context

The application currently has multiple header components (e.g., `ProjectDesignHeader`, `ProjectIdeaHeader`, `ProjectFeatureHeader`, `ProjectTicketsHeader`, `ProjectPromptHeader`) that share a very similar structure and functionality. Each of these components displays a category-specific icon, a title with a count, and a button group for adding new items and exporting all items within that category. This duplication of code leads to redundancy and makes maintenance and future updates more cumbersome.

## Decision

To improve code maintainability, reduce redundancy, and enhance consistency across the application, a new shared component named `ProjectCategoryHeader` will be created. This component will encapsulate the common structure and logic found in the individual project category header components. The existing project category header components will then be refactored to utilize this new `ProjectCategoryHeader` component, passing the necessary props to customize its appearance and behavior for each specific category.

## Consequences

### Positive

- **Reduced Code Duplication**: Eliminates redundant code across multiple header components.
- **Improved Maintainability**: Changes to the header structure or common functionality can be made in a single place (`ProjectCategoryHeader`), simplifying maintenance and reducing the risk of inconsistencies.
- **Enhanced Consistency**: Ensures a uniform look and feel for all project category headers.
- **Easier Feature Development**: New project categories can be added more quickly by simply using the `ProjectCategoryHeader` and providing the appropriate props, rather than creating a new header component from scratch.

### Negative

- **Initial Refactoring Effort**: Requires an upfront effort to create the new component and refactor existing ones.
- **Increased Abstraction**: The introduction of a new generic component might slightly increase the abstraction level, which could require developers to understand the props system of `ProjectCategoryHeader`.
