# 0006-generalize-button-components

## Status

Proposed

## Context

The `src/components/atoms/buttons` directory contains several button components (e.g., `StopButton`, `StartButton`, `ViewLogButton`, `FeaturesButton`) that directly implement the Shadcn UI `Button` component. These components manually include icons and text, leading to code duplication and inconsistencies in how buttons are rendered and configured.

A `GenericButton` component already exists in `src/components/atoms/buttons/GenericButton.tsx` which provides a more generalized approach to rendering buttons with optional icons, text, variants, and other properties. However, not all button components are currently utilizing this generic component.

## Decision

The decision is to refactor all specific button components within `src/components/atoms/buttons` to utilize the existing `GenericButton` component. This will:

1.  **Reduce Code Duplication**: Eliminate redundant code for button rendering and icon placement.
2.  **Improve Consistency**: Ensure all buttons adhere to a unified structure and styling, leveraging the `GenericButton`'s props.
3.  **Enhance Maintainability**: Centralize button logic and styling, making future updates and modifications easier.
4.  **Promote Reusability**: Encourage the use of `GenericButton` for any new button components, further streamlining development.

## Consequences

*   **Positive**:
    *   Cleaner and more maintainable codebase.
    *   Reduced bundle size due to less redundant code.
    *   Easier to introduce new button types or modify existing ones.
    *   Improved developer experience by providing a standardized way to create buttons.
*   **Negative**:
    *   Initial refactoring effort required to update existing button components.
    *   Potential for minor visual changes if existing buttons had highly customized styling that needs to be adapted to `GenericButton`'s capabilities.
