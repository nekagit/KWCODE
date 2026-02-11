# 2026-02-11: Refactor Forms to Shared Components

## Status

Accepted

## Context

The existing form components in `src/components/atoms/forms/` were using direct implementations of `Label`, `Input`, and `Textarea` from the `@/components/ui/` library, or custom `FeatureInput` and `LabeledInput` components. This led to duplication of code for common form field structures and a lack of consistency in how form fields were rendered and managed across the application.

## Decision

To improve reusability, maintainability, and consistency, the form components were refactored to leverage new shared atomic components:

1.  **`FormField`**: A generic component to encapsulate a `Label` and its children (the actual input component). This provides a consistent layout and handles basic accessibility concerns.
2.  **`GenericInputWithLabel`**: A shared component that composes `FormField` and `@/components/ui/input` to provide a standardized input field with a label.
3.  **`GenericTextareaWithLabel`**: A shared component that composes `FormField` and `@/components/ui/textarea` to provide a standardized textarea with a label.

The following files were created (under shared root, no subfolders):
- `src/components/shared/FormField.tsx`
- `src/components/shared/GenericInputWithLabel.tsx`
- `src/components/shared/GenericTextareaWithLabel.tsx`

The following files were refactored to use these new shared components:
- `src/components/atoms/forms/PromptFormFields.tsx`
- `src/components/atoms/forms/FeatureAddForm.tsx`
- `src/components/atoms/forms/PromptRecordGeneratorForm.tsx`

The redundant `src/components/atoms/inputs/FeatureInput.tsx`, `src/components/shared/LabeledInput.tsx`, and `src/components/shared/FieldWrapper.tsx` files were deleted.

## Consequences

*   **Improved Reusability**: Common form field patterns are now encapsulated in reusable components, reducing code duplication.
*   **Enhanced Consistency**: All refactored forms now utilize the same underlying structure for their input fields, leading to a more consistent UI/UX.
*   **Easier Maintenance**: Changes to the basic structure of a form field (e.g., styling, accessibility attributes) only need to be made in one place.
*   **Simplified Form Development**: New forms can be developed more quickly by composing these shared components.
