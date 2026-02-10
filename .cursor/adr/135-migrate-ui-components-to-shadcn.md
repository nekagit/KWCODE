# ADR 135: Migrate UI components to Shadcn

## Context

The project currently uses a mix of custom UI components in `src/components/ui` and some `shadcn` components. Several `src/components/ui` files were deleted, leading to "Module not found" errors when building the application. This indicates a migration towards using `shadcn` components exclusively.

## Decision

We will migrate all existing custom UI components in `src/components/ui` to their `shadcn` equivalents. Specifically, for the immediate errors encountered, `Alert`, `Button`, `Card`, `Checkbox`, `Input`, `Label`, `ScrollArea`, and `Select` components will be replaced with their respective `shadcn` versions.

## Consequences

- **Positive**: 
    - Standardized UI components across the application, leading to a more consistent look and feel.
    - Reduced maintenance burden by leveraging a well-maintained component library.
    - Access to a wider range of pre-built and customizable UI components from `shadcn`.
    - Improved development efficiency by using a robust and documented component library.

- **Negative**: 
    - Initial effort required to identify and replace all custom UI components with `shadcn` equivalents.
    - Potential for minor visual changes or behavioral differences that may require adjustments.
    - Need to install and configure `shadcn` components if not already fully set up.

## Action Items

- Replace `Alert` imports and usage from `@/components/ui/alert` to `@/components/shadcn/alert`.
- Replace `Button` imports and usage from `@/components/ui/button` to `@/components/shadcn/button`.
- Replace `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` imports and usage from `@/components/ui/card` to `@/components/shadcn/card`.
- Replace `Checkbox` imports and usage from `@/components/ui/checkbox` to `@/components/shadcn/checkbox`.
- Replace `Input` imports and usage from `@/components/ui/input` to `@/components/shadcn/input`.
- Replace `Label` imports and usage from `@/components/ui/label` to `@/components/shadcn/label`.
- Replace `ScrollArea` imports and usage from `@/components/ui/scroll-area` to `@/components/shadcn/scroll-area`.
- Replace `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports and usage from `@/components/ui/select` to `@/components/shadcn/select`.

## Status

Proposed. Migration is in progress for the identified components. Further components may be identified and migrated as development continues.