# 0018-refactor-theme-preview-components-to-shadcn

## Status
Accepted

## Context
The `src/components/atoms/theme` directory contained several components (`ThemeButtonPreview.tsx`, `ThemeIconPreview.tsx`, `ThemeColorSwatches.tsx`) that were using custom styling with `div` and `span` elements and inline styles. These components are responsible for previewing different aspects of the UI theme.

## Decision
The decision was made to refactor these components to utilize Shadcn UI components for better consistency, reusability, and adherence to modern React development practices. Specifically:

- `ThemeButtonPreview.tsx`: The button previews were refactored to use the Shadcn `Button` component.
- `ThemeIconPreview.tsx`: The "Icons" label was refactored to use the Shadcn `Badge` component.
- `ThemeColorSwatches.tsx`: The "Card" label was refactored to use the Shadcn `Badge` component. The color swatches themselves remained as `div` elements, as there isn't a direct Shadcn component for this, but their styling was reviewed for consistency.

## Consequences
- **Improved Code Consistency**: The UI components now align with the Shadcn design system, leading to a more consistent look and feel across the application.
- **Enhanced Maintainability**: Using established UI components reduces custom code, making the components easier to understand, maintain, and update.
- **Reduced Styling Duplication**: Replaced inline styles and custom Tailwind classes with Shadcn components, promoting a more modular and less repetitive styling approach.
- **Potential for Future Expansion**: The use of Shadcn components opens up possibilities for easier integration of other Shadcn features and components in the future.
