# ADR 139: Project details – remove Export to Markdown, Edit buttons, and Edit page

## Context

The project details page exposed per-section "Export to Markdown" buttons and "Edit" buttons (linking to `/projects/:id/edit`), and a dedicated project edit page. Users requested a simpler project details experience: remove all export-to-markdown actions, all edit buttons, and the edit page.

## Decision

- **Remove from project details:**
  - All "Export to Markdown" (or "Export to Architecture.md") buttons in each category header (Design, Ideas, Features, Tickets, Prompts, Architectures).
  - All "Edit" buttons in those category headers that linked to `/projects/:id/edit`.
  - The Edit button in the main project header (top of project details).
- **Remove the edit page:**
  - Delete the route `/projects/[id]/edit` and its page component.
  - Remove the `EditProjectPageContent` organism and the `EditProjectHeader` molecule (only used by the edit page).
- **Keep:**
  - Delete button on the project header (unchanged).
  - Category headers show only title, icon, and description (no action buttons).
  - Export API (`getProjectExport`) and `ExportContentDialog` remain in the codebase for potential future use; they are no longer used from project details.

## Implementation

- **ProjectCategoryHeader**: Dropped `exportLoading`, `generateExport`, `category`, and `projectId` props; removed `ButtonGroup` with Export and Edit buttons; header now only renders `PageHeader` with title, icon, description.
- **ProjectHeader**: Removed Edit button and `Link`/`Settings` import; kept Delete button.
- **ProjectDetailsPageContent**: Removed export state (`showExportDialog`, `exportContent`, `exportLoading`), `generateExport` callback, `ExportContentDialog`, and all `exportLoading`/`generateExport` props passed to tab components.
- **Tab components** (ProjectDesignTab, ProjectIdeasTab, ProjectFeaturesTab, ProjectTicketsTab, ProjectPromptRecordsTab, ProjectArchitectureTab): Removed `exportLoading` and `generateExport` from props and from `ProjectCategoryHeader` usage.
- **Deleted:** `src/app/projects/[id]/edit/page.tsx`, `EditProjectPageContent.tsx`, `EditProjectHeader.tsx`.

## Consequences

- Project details is read-only for project metadata from the UI; no dedicated edit page or per-section export/edit actions.
- Fewer entry points and less UI clutter on the project details page.
- Project name/path and other project-level edits (if needed) would require another mechanism or future ADR.
