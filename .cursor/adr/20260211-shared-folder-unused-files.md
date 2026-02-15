# Shared folder: unused files check

## Date
2026-02-11

## Summary

**Unused component files** (no imports from outside `src/components/shared`):

| File | Note |
|------|------|
| **Header.tsx** | Not imported anywhere. ProjectCategoryHeader uses molecule `PageHeader`, not this. |
| **ProjectHeader.tsx** | Not imported anywhere. Same pattern as Header (category header + buttons); superseded by molecule layout. |
| **List.tsx** | Not imported anywhere. |
| **PageHeader.tsx** | Not imported anywhere. App uses `@/components/molecules/LayoutAndNavigation/PageHeader` instead. |
| **Table.tsx** | Not imported anywhere. Tables use `@/components/ui/table` (Radix). |
| **Tabs.tsx** | Not imported anywhere. Tabs use `@/components/ui/tabs` (Radix). |
| **CheckboxGroup.tsx** | Not imported anywhere. ProjectCheckboxGroup uses CheckboxComponent directly and its own layout. |

**Used shared components** (imported from outside shared):

- Accordion, BadgeComponent, ButtonComponent, ButtonGroup, Card, CheckboxComponent, Dialog, DisplayPrimitives, EmptyState, ErrorDisplay, FloatingTerminalDialog, Form, FormField, GenericInputWithLabel, GenericTextareaWithLabel, GridContainer, JsonDisplay, LabeledTextarea, ListItemCard, ProjectCategoryHeader, TerminalSlot

**Config / docs** (not “components”; keep or remove by convention):

- **shared-classes.json**, **shared-classes.ts** — used by shared components and design system; keep.
- **shared-design.css** — imported in `globals.css`; keep.
- **tailwind-classes.json**, **tailwind-catalog.json** — not imported by app code; used by tooling/scripts (e.g. extract) if present; optional.
- **README-tailwind.md** — documentation; keep.
- **Desing.md** — likely typo for “Design”; doc only; rename or remove.

## Action taken (2026-02-11)

- **Deleted** the 7 unused component files: `Header.tsx`, `ProjectHeader.tsx`, `List.tsx`, `PageHeader.tsx`, `Table.tsx`, `Tabs.tsx`, `CheckboxGroup.tsx`.
- **Updated** `shared-classes.json`: removed the corresponding top-level keys (Header, ProjectHeader, List, PageHeader, Table, Tabs, CheckboxGroup) and their entries from `_catalog`.
- **shared-design.css** had no component-specific rules for these; no change.
