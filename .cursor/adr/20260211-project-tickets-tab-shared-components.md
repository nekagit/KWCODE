# ADR: ProjectTicketsTab refactor to use shared components

## Date
2026-02-11

## Status
Accepted

## Context
`ProjectTicketsTab.tsx` was using Radix/shadcn UI primitives (Dialog, Label, Input, Textarea) and inline patterns for loading and button groups, making it inconsistent with other tabs and harder to maintain.

## Decision
Refactor `ProjectTicketsTab` to use shared components where possible:

- **Dialog** → **shared Dialog** (`@/components/shared/Dialog`) for Add prompt, Add ticket, and Add feature dialogs. Use `isOpen`, `title`, `onClose`, `actions` (footer buttons), and `children` (body).
- **Form** → **shared Form** for dialog body content, with `onSubmit` that prevents default and calls the same handler as the primary action (Save/Add).
- **GenericInputWithLabel** / **GenericTextareaWithLabel** → replace all `Label` + `Input` and `Label` + `Textarea` pairs in those dialogs.
- **FormField** → wrap the Priority `Select` (and any other non-input field that needs a label) in shared `FormField`.
- **ButtonGroup** → wrap dialog footer buttons (Cancel + Save/Add) and the “Add ticket” / “Add feature” row with shared `ButtonGroup` (alignment right for footers, left for the add buttons).
- **LoadingState** → use `LoadingState` from `@/components/shared/EmptyState` for the kanban loading spinner instead of an inline div + Loader2.

Keep using:
- **Card**, **EmptyState**, **ErrorDisplay**, **ProjectCategoryHeader** (already shared).
- **Button**, **Select**, **DropdownMenu** from UI where needed (toolbar, prompt selector, dropdowns).
- **ScrollArea** for terminal logs and existing scroll areas.

## Consequences
- Fewer direct imports from `@/components/ui` (removed Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label, Input, Textarea for this file).
- Consistent look and behavior with shared design (shared-design.css, shared-classes.json) for dialogs, forms, and button groups.
- Single place to change dialog/form/loading patterns across the app.
