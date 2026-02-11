# ADR: Delete unused molecule component files

## Context
An audit of `src/components/molecules` identified 14 files that were never imported anywhere in the app: either dead code or duplicates of components that live in another path and are the ones actually used.

## Decision
Delete all 14 unused files under `src/components/molecules` to remove dead code and duplicate implementations.

## Deleted files

### CardsAndDisplay
- `LocalProjectsCard.tsx` — removed from UI earlier; only in ADR/docs
- `PromptsAndTimingCard.tsx` — never imported
- `ProjectCard.tsx` — never imported

### CoverageDashboard (duplicate)
- `CoverageDashboard/CoverageDashboard.tsx` — duplicate; app uses `DashboardsAndViews/CoverageDashboard.tsx`

### FeatureTabContent (duplicate)
- `FeatureTabContent/FeatureTabContent.tsx` — duplicate; app uses `TabAndContentSections/FeatureTabContent.tsx`

### FormsAndDialogs
- `ExportContentDialog.tsx` — never imported
- `ProjectForm.tsx` — never imported

### ListsAndItems
- `RunLogItem.tsx` — never imported

### ListsAndTables
- `PromptCheckboxList.tsx` — never imported
- `TicketsDisplayTable/TicketsDisplayTable.tsx` — never imported

### ProjectsTabContent (duplicate)
- `ProjectsTabContent/ProjectsTabContent.tsx` — duplicate; app uses `TabAndContentSections/ProjectsTabContent.tsx`

### ThemeSelector (duplicate)
- `ThemeSelector/ThemeSelector.tsx` — duplicate; app uses `UtilitiesAndHelpers/ThemeSelector.tsx`

### UtilitiesAndHelpers
- `TemplateIdeaAccordion.tsx` — never imported
- `ProjectNotFoundState.tsx` — never imported

## Status
Completed.

## Consequences
- 14 fewer unused or duplicate files in the molecules layer.
- No runtime or import impact; none of these were referenced.
- Empty folders (e.g. `CoverageDashboard/`, `FeatureTabContent/`, `ProjectsTabContent/`, `ThemeSelector/`, `TicketsDisplayTable/`) may remain; they can be removed in a follow-up if desired.
- If any of this behavior is needed again, components can be re-added or restored from version control.
