# 0004: Standardize Type Imports

## Status
Accepted

## Context
During a review of the `src/components/atoms` directory, it was identified that several components were importing type definitions (`Feature`, `Ticket`) from inconsistent locations. Specifically:
- `src/components/atoms/TicketCheckboxGroup.tsx` was importing `Ticket` from `@/app/page`.
- `src/components/atoms/FeatureListItem.tsx` was importing `Feature` and `Ticket` from `@/components/organisms/HomePageContent`.

This inconsistency can lead to confusion, potential circular dependencies, and makes it harder to maintain a clear separation of concerns within the codebase. It also deviates from the established pattern of defining types in a dedicated `@/types/` directory.

## Decision
To standardize type imports and improve code maintainability, the following changes were made:
- In `src/components/atoms/TicketCheckboxGroup.tsx`, the import for `Ticket` was changed from `type { Ticket } from "@/app/page";` to `type { Ticket } from "@/types/ticket";`.
- In `src/components/atoms/FeatureListItem.tsx`, the imports for `Feature` and `Ticket` were changed from `type { Feature, Ticket } from "@/components/organisms/HomePageContent";` to `type { Feature } from "@/types/project";` and `type { Ticket } from "@/types/ticket";`.

These changes ensure that type definitions are consistently imported from their designated type definition files.

## Consequences
- **Improved Code Organization:** Type definitions are now sourced from a centralized and logical location, making the codebase easier to understand and navigate.
- **Reduced Potential for Errors:** Consistent imports reduce the likelihood of issues arising from conflicting type definitions or unexpected behavior due to different versions of the same type being used.
- **Enhanced Maintainability:** Future development and refactoring will be simpler as developers can confidently locate and update type definitions without searching through various component files.
- **No functional changes:** These changes are purely for code organization and do not alter the runtime behavior or functionality of the application.
