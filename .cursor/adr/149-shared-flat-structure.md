# ADR 149: Shared components — flat structure (no subfolders)

## Status

Accepted.

## Context

`src/components/shared` contained subfolders `forms/` and `inputs/` with a small number of files each (`FormField.tsx`, `GenericInputWithLabel.tsx`, `GenericTextareaWithLabel.tsx`). The user requested a single flat shared root with no subfolders for simpler imports and navigation.

## Decision

- Move all files from shared subfolders to `src/components/shared` root.
- Remove subfolders `forms/` and `inputs/`.
- Update all imports to use `@/components/shared/<ComponentName>` (e.g. `@/components/shared/FormField`, `@/components/shared/GenericInputWithLabel`, `@/components/shared/GenericTextareaWithLabel`).

## Consequences

- All shared components live at one level; no nested paths.
- Imports are shorter and consistent (`@/components/shared/FormField` instead of `@/components/shared/forms/FormField`).
- ADR 20260211-refactor-forms-to-shared-components.md updated to reflect new file paths.
