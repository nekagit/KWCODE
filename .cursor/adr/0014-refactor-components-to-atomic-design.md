# 0014-refactor-components-to-atomic-design

## Status
Proposed

## Context
The application currently has several large components that are not consistently organized according to Atomic Design principles. This makes the codebase harder to maintain, understand, and reuse components effectively. The user has specifically requested refactoring the following files:
- `src/components/app-shell.tsx`
- `src/components/clear-loading-overlay.tsx`
- `src/components/cursor-files-tree.tsx`
- `src/components/root-loading-overlay.tsx`
- `src/components/tickets-data-table.tsx`

The goal is to restructure these components into atoms, molecules, and organisms, and to identify and utilize shared components where appropriate.

## Decision
The refactoring will follow the Atomic Design methodology. This involves breaking down complex components into smaller, reusable parts:

**Atoms:** These are the basic building blocks of our UI. They are purely presentational and have no internal state or business logic. Examples include buttons, inputs, icons, and basic typographic elements. Many of these already exist in `@/components/ui`.

**Molecules:** These are groups of atoms bonded together to form a relatively simple, self-contained UI component. They combine atoms to perform a specific function. Examples include a form input with a label, a navigation link with an icon, or a badge with text.

**Organisms:** These are relatively complex components composed of groups of molecules and/or atoms joined together to form a distinct section of an interface. They represent discrete sections of a page. Examples include a navigation sidebar, a data table, or a loading screen.

**Templates & Pages (Implicit):** While not explicitly refactoring into templates and pages, the existing top-level components (`AppShell`, `TicketsDataTable`, etc.) will largely become organisms or orchestrate organisms.

**Shared Components/Utilities:**
*   Identify existing shared UI components (e.g., from `@/components/ui`) and ensure consistent usage.
*   Extract utility functions (e.g., `formatDate`, `normalizePath`, `scatter`) into a dedicated `src/lib/utils.ts` file or a new `src/utils` directory.
*   Abstract common styling patterns (e.g., `glasgmorphism`) into reusable CSS classes or Tailwind utility classes.

### Proposed Component Structure:

**1. `src/components/app-shell.tsx`**
*   **Atoms:** `Button`, `Badge`, `Popover`, `PopoverContent`, `PopoverTrigger`, `Empty`, `Tooltip`, `TooltipContent`, `TooltipTrigger`, `Link`, Lucide icons. (These are mostly from `@/components/ui` or external libraries).
*   **Molecules:**
    *   `NavLinkItem`: Represents a single navigation link with an icon and label, handling active states and tooltip display.
    *   `TerminalStatusBadge`: Displays the number of running terminals with an icon and badge.
    *   `RunLogItem`: An individual item in the "Running terminals" popover, showing run details and action buttons (View log, Stop).
    *   `SidebarToggle`: The button to collapse/expand the sidebar.
*   **Organisms:**
    *   `SidebarNavigation`: Contains the `NavLinkItem`s, grouped into sections (Dashboard, Tools, Work). This would replace `SidebarNavLinks` and `SidebarNavWithParams`.
    *   `RunningTerminalsPopover`: The popover that displays the list of `RunLogItem`s.
    *   `AppShell`: The main organism that orchestrates the `SidebarNavigation`, `RunningTerminalsPopover`, and the main content area.

**2. `src/components/clear-loading-overlay.tsx`**
*   This component can remain largely as is, potentially moved to `src/components/atoms` or `src/components/utilities` as it's a very simple utility component that manipulates the DOM. If `root-loading` becomes a component, this might interact with its state/props.

**3. `src/components/cursor-files-tree.tsx`**
*   **Atoms:** `Button`, Lucide icons (`Folder`, `FolderOpen`, `FileText`, `ChevronRight`, `ChevronDown`, `Plus`).
*   **Molecules:**
    *   `FolderTreeItem`: A clickable folder entry with expand/collapse icon and folder icon.
    *   `FileTreeItem`: A file entry with file icon, name, and an "Add" button.
*   **Organisms:**
    *   `CursorFilesTree`: The main organism, responsible for building the tree structure and rendering `FolderTreeItem` and `FileTreeItem` components recursively.
*   **Utilities:** `normalizePath`, `buildTree`, `sortNode` should be extracted to a utility file.

**4. `src/components/root-loading-overlay.tsx`**
*   **Atoms:** Basic `div` elements for shapes and `span` for text (heavily styled).
*   **Molecules:**
    *   `RaindropCircle`: A single animated raindrop.
    *   `FlyingStarItem`: A single animated star.
    *   `LoadingPulseDot`: A single pulsating dot for the "kwcode" loading animation.
*   **Organisms:**
    *   `RainEffect`: Orchestrates multiple `RaindropCircle` components.
    *   `CursorLightGlow`: Handles the mouse-reactive glow effect.
    *   `StarField`: Orchestrates multiple `FlyingStarItem` components.
    *   `MoonGraphic`: Renders the moon with its glow.
    *   `KwcodeBranding`: Displays the "kwcode" text and pulsating dots.
    *   `RootLoadingOverlay`: The top-level organism that combines all these visual effects.
*   **Utilities:** `scatter` function to `src/lib/utils.ts`.

**5. `src/components/tickets-data-table.tsx`**
*   **Atoms:** `Button`, `Input`, `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `Badge`, `Tooltip`, `TooltipContent`, `TooltipTrigger`, `Empty`, Lucide icons.
*   **Molecules:**
    *   `DataTableHeader`: A sortable column header.
    *   `StatusBadge`: Displays ticket status.
    *   `DescriptionTooltip`: Shows full description on hover.
    *   `TicketActionsMenu`: Dropdown for ticket actions (e.g., delete).
    *   `TicketStatusUpdater`: Select component for changing ticket status.
    *   `PaginationControls`: Buttons and text for table pagination.
    *   `RowsPerPageSelector`: Select component for choosing rows per page.
    *   `TicketSearchInput`: Input field for global table filtering.
*   **Organisms:**
    *   `TicketsTable`: The main table structure, including header and body.
    *   `TicketsTableControls`: Contains the search input and pagination/rows per page selectors.
    *   `TicketsDataTable`: The main organism orchestrating the table and its controls.
*   **Utilities:** `formatDate` to `src/lib/utils.ts`.

## Consequences
*   Improved code organization and readability.
*   Enhanced reusability of components across the application.
*   Easier maintenance and debugging due to smaller, more focused components.
*   Potential for a more consistent UI/UX due to standardized component usage.
*   Initial refactoring effort and potential for breaking changes during the transition (will be managed through careful testing and incremental changes).
*   Clearer separation of concerns between presentational and logical components.

## Action Plan

1.  **Create/Update `src/lib/utils.ts`**: Extract common utility functions (`formatDate`, `normalizePath`, `scatter`) into this file.
2.  **Refactor `app-shell.tsx`**:
    *   Create `src/components/molecules/Navigation/NavLinkItem.tsx`
    *   Create `src/components/molecules/Display/TerminalStatusBadge.tsx`
    *   Create `src/components/molecules/ListsAndItems/RunLogItem.tsx`
    *   Create `src/components/molecules/ControlsAndButtons/SidebarToggle.tsx`
    *   Create `src/components/organisms/Navigation/SidebarNavigation.tsx`
    *   Create `src/components/organisms/Display/RunningTerminalsPopover.tsx`
    *   Update `src/components/app-shell.tsx` to use these new components.
3.  **Refactor `clear-loading-overlay.tsx`**:
    *   Consider moving to `src/components/utilities/ClearLoadingOverlay.tsx` if it remains a utility.
4.  **Refactor `cursor-files-tree.tsx`**:
    *   Create `src/components/molecules/Navigation/FolderTreeItem.tsx`
    *   Create `src/components/molecules/Navigation/FileTreeItem.tsx`
    *   Update `src/components/cursor-files-tree.tsx` to use these new components.
5.  **Refactor `root-loading-overlay.tsx`**:
    *   Create `src/components/atoms/VisualEffects/RaindropCircle.tsx`
    *   Create `src/components/atoms/VisualEffects/FlyingStarItem.tsx`
    *   Create `src/components/atoms/VisualEffects/LoadingPulseDot.tsx`
    *   Create `src/components/molecules/VisualEffects/RainEffect.tsx`
    *   Create `src/components/molecules/VisualEffects/CursorLightGlow.tsx`
    *   Create `src/components/molecules/VisualEffects/StarField.tsx`
    *   Create `src/components/molecules/VisualEffects/MoonGraphic.tsx`
    *   Create `src/components/molecules/Display/KwcodeBranding.tsx`
    *   Update `src/components/root-loading-overlay.tsx` to use these new components.
6.  **Refactor `tickets-data-table.tsx`**:
    *   Create `src/components/molecules/Tables/DataTableHeader.tsx`
    *   Create `src/components/molecules/Display/StatusBadge.tsx`
    *   Create `src/components/molecules/Display/DescriptionTooltip.tsx`
    *   Create `src/components/molecules/FormsAndDialogs/TicketActionsMenu.tsx`
    *   Create `src/components/molecules/FormsAndDialogs/TicketStatusUpdater.tsx`
    *   Create `src/components/molecules/ControlsAndButtons/PaginationControls.tsx`
    *   Create `src/components/molecules/ControlsAndButtons/RowsPerPageSelector.tsx`
    *   Create `src/components/molecules/FormsAndDialogs/TicketSearchInput.tsx`
    *   Create `src/components/organisms/Tables/TicketsTable.tsx`
    *   Create `src/components/organisms/Controls/TicketsTableControls.tsx`
    *   Update `src/components/tickets-data-table.tsx` to use these new components.
7.  **Review and Test**: After each major refactoring step, ensure the application still functions correctly. Run relevant tests or manually verify the UI.
