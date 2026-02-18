# ADR 0146: Dashboard Select all / Deselect all for active projects

## Status

Accepted.

## Context

The Home page "Projects" tab and "All data" tab show the list of repos with checkboxes to mark them active for runs (cursor_projects / Run tab). Users had to toggle each project one by one. There was no way to activate or deactivate all projects in one action.

## Decision

- **ProjectsTabContent**: Add optional `onSelectAll` and `onDeselectAll` callbacks. When both are provided, show "Select all" and "Deselect all" buttons in the card footer (next to "Save active to cursor_projects.json"). Icons: CheckSquare and Square (Lucide).
- **AllDataTabContent**: Add the same optional callbacks. In the Projects card footer, show "Select all" and "Deselect all" next to "Save active" when callbacks are provided.
- **HomePageContent**: Pass `onSelectAll={() => setActiveProjects([...allProjects])}` and `onDeselectAll={() => setActiveProjects([])}` to both tabs so the run store's active list is updated in one click. Persistence still requires the user to click "Save active" (or "Save active to cursor_projects.json") if they want to write cursor_projects.json.

## Consequences

- Users can activate or deactivate all projects from the Dashboard without toggling each checkbox.
- Behaviour is consistent on both "Projects" and "All data" tabs.
- No new Tauri commands or API routes; uses existing `setActiveProjects` from the run store.
- Optional props keep the components reusable in contexts that do not provide bulk actions.
