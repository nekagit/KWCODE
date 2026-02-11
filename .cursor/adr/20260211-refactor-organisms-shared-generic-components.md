# ADR: Refactor Organisms to Shared Generic Components (Atomic Design)

## Context

Similar organism groups in `src/components/organisms` were duplicated in structure and behavior. The goal was to have one organism per group driven by config/data, shared generic molecules and atoms, and a clear atom-to-molecule-to-organism hierarchy.

## Decision

1. **Three-tab resource (Ideas + Architecture)**  
   Introduced a single organism `ThreeTabResourcePageContent` that accepts `config` (title, description, icon, tabLabels), an opaque `resource` bag, and render props for the three tabs and dialogs. `IdeasPageContent` and `ArchitecturePageContent` remain as thin wrappers that own domain state and pass config + resource + slots to this organism. New molecule `ThreeTabLayout` wraps UI Tabs with three content slots.

2. **Thin wrappers (PromptsAndTiming, ProjectTicketsKanbanColumn)**  
   Removed these organisms. `PromptsTabContent` now imports and renders `PromptRecordSelectionCard` directly. `ProjectTicketsTab` now imports and renders `KanbanColumnCard` directly with the same props (minus the unused `kanbanFeatures`).

3. **Ticket table pair (TicketsTable, TicketsTableControls)**  
   Replaced with a single molecule `DataTableWithControls` that composes `DataTableLayout`, optional `searchSlot`, `RowsPerPageSelector`, and `PaginationControls`. `tickets-data-table.tsx` uses `DataTableWithControls` with `TicketSearchInput` as `searchSlot`. Removed organisms `TicketsTable` and `TicketsTableControls`.

4. **Placeholder (DesignPageContent)**  
   New atom `EmptyPagePlaceholder` (title, optional description). `DesignPageContent` now renders this atom only.

5. **Header + single content (NewProjectPageContent, ConfigurationPageContent)**  
   New organism `SingleContentPage` with props: title, description, icon, backLink, layout ("simple" | "card"), error, children. New molecule `PageWithHeader` (optional back link + PageHeader + children). NewProject uses `SingleContentPage` with layout "simple" and backLink; Configuration uses layout "card" with error. `SingleContentPage` implements the card layout with `Card` and `ErrorDisplay` directly; `ThemedPageLayout` is no longer used by Configuration.

## New and changed artifacts

- **Atoms:** `EmptyPagePlaceholder` in `src/components/atoms/displays/`.
- **Molecules:** `ThreeTabLayout`, `PageWithHeader` in `LayoutAndNavigation`; `DataTableWithControls` in `Tables`.
- **Organisms:** `ThreeTabResourcePageContent`, `SingleContentPage` in `src/components/organisms/`.
- **Removed organisms:** `PromptsAndTiming`, `ProjectTicketsKanbanColumn`, `TicketsTable`, `TicketsTableControls`.
- **Updated:** `IdeasPageContent`, `ArchitecturePageContent` (thin wrappers around `ThreeTabResourcePageContent`); `DesignPageContent` (uses `EmptyPagePlaceholder`); `NewProjectPageContent`, `ConfigurationPageContent` (use `SingleContentPage`); `PromptsTabContent`, `ProjectTicketsTab` (use molecules directly); `tickets-data-table.tsx` (uses `DataTableWithControls`).

## Status

Completed.

## Consequences

- One shared organism per group (or no organism for thin-wrapper cases), with different data/slots per route.
- Shared layout and table UX live in molecules; organisms compose them.
- App route files are unchanged; only the implementation of the page-content components changed.
- Future "three-tab resource" or "header + content" pages can reuse the same organisms and molecules with new config and slots.
