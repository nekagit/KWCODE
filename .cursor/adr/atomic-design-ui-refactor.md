# 135. Atomic Design UI Refactor

## Status
Proposed

## Context
The current UI component structure in `src/components` is a flat list of Shadcn UI components and some custom components. As the application grows, this structure can become difficult to manage, leading to inconsistent UI, code duplication, and a steeper learning curve for new developers.

To address these issues, we will refactor the UI components using the Atomic Design methodology. This approach will provide a clear, hierarchical structure for components, promoting reusability, consistency, and maintainability.

## Decision
We will adopt the Atomic Design methodology for organizing UI components. The component hierarchy will be as follows:

1.  **Shadcn Components**: The raw, unmodified Shadcn UI components will reside in `src/components/shadcn`. These are the foundational building blocks.
2.  **Atoms**: These are the smallest functional UI elements, often directly derived from Shadcn components but with app-specific styling or minor modifications (e.g., "glasgmorphism" styling). They will be located in `src/components/atoms`.
3.  **Molecules**: These combine multiple atoms to form slightly more complex, reusable UI elements. They will be located in `src/components/molecules`.
4.  **Organisms**: These combine molecules and atoms to form distinct sections of the UI, representing larger, independent components. They will be located in `src/components/organisms`.
5.  **Pages**: The application's pages in `src/app` will primarily consist of organisms, orchestrating their arrangement to form complete views.

## Consequences
*   **Improved Reusability**: Components will be designed to be highly reusable across the application.
*   **Enhanced Consistency**: A clear hierarchy and defined roles for each component type will lead to a more consistent UI.
*   **Easier Maintenance**: Changes to individual components will be isolated, reducing the risk of unintended side effects.
*   **Clearer Structure**: New developers will have an easier time understanding the codebase and contributing to the UI.
*   **Initial Refactoring Effort**: There will be an initial effort required to refactor existing components and update page imports.

## Next Steps
1.  Move existing Shadcn components to `src/components/shadcn`.
2.  Create `src/components/atoms`, `src/components/molecules`, and `src/components/organisms` directories.
3.  Refactor existing UI components into the new Atomic Design structure.
4.  Update page imports in `src/app` to use the new component hierarchy.
