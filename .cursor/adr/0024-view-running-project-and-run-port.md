# ADR 0024: View Running Project and run port in project details

## Status

Accepted.

## Context

Users wanted to (1) remove the "Clean cursor output" button from project details and (2) add a way to view the running app (e.g. dev server) in context. The run port (localhost:XXXX) should be persisted per project and shown in the top bar next to Initialize and the project path, with a "View Running Project" button that opens a modal containing an iframe of the app. The Project tab already has a Run button that runs the app and detects a localhost URL from output; that URL (or its port) should be savable as the project's run URL.

## Decision

- **Remove "Clean cursor output" button:** Remove the button from the project details top bar only. Keep the `cleanAnalysisDocs` API and implementation for potential future use elsewhere.
- **Project run port:** Add an optional `runPort?: number` (1–65535) to the Project model. It is stored in projects.json (Next API) and in Tauri's project store, and displayed in the project details top bar when set.
- **Top bar run port UI:** When `runPort` is set: show a badge "localhost:{runPort}" with an edit (pencil) control to change the port. When not set: show a "Set port" input + Save. Saving calls `updateProject(projectId, { runPort })` and refreshes the project.
- **View Running Project button:** Add a button in the top bar (next to Analyze all) that opens a modal. If `runPort` is not set, the button is disabled with tooltip "Set run port above first". If set, the modal contains an iframe with `src={http://localhost:${project.runPort}}` and an "Open in new tab" fallback link.
- **Optional: Use as project URL:** In the Project tab Run section, when the current run has a detected `localUrl` and the project's `runPort` is unset or different, show a "Use as project URL" button that parses the port from the URL, calls `updateProject(projectId, { runPort })`, and invokes a parent callback (e.g. `fetchProject`) so the top bar updates.

## Implementation

- `src/types/project.ts`: Added `runPort?: number` to `Project`.
- `src/app/api/data/projects/[id]/route.ts`: PUT merge includes `runPort` when valid (number in 1–65535).
- `src-tauri/src/lib.rs`: Added `run_port: Option<u16>` to `Project` struct; merge in `update_project`; include `runPort` in `get_project_resolved` JSON.
- `src/lib/api-projects.ts`: Added `runPort?: number` to `CreateProjectBody`.
- `src/lib/api-validation.ts`: Added `runPort: z.number().int().min(1).max(65535).optional()` to `createProjectSchema`.
- `src/components/organisms/ProjectDetailsPageContent.tsx`: Removed Clean cursor output button and `cleaningDocs` state; removed `cleanAnalysisDocs` import. Added run port display/edit and "Set port" UI, "View Running Project" button, and a Dialog modal with iframe (and "Open in new tab" link). Added state for `viewRunningOpen`, `portEdit`, `portInput`, `savingPort`; import `updateProject`, Dialog components, Input, Pencil, Monitor.
- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx`: Added optional `onProjectUpdate` callback; "Use as project URL" button when run has `localUrl` and project runPort is unset or different; `getPortFromLocalUrl` helper; `updateProject` call and `savingPort` state.
- Parent passes `onProjectUpdate={fetchProject}` to `ProjectProjectTab` so the top bar refetches after saving the port from the Run section.

## Consequences

- Users can set and edit the project run port in the top bar and open the running app in a modal (iframe) or in a new tab.
- The "Clean cursor output" action is no longer in the project details UI; the API remains available.
- Optional flow: run the app from the Project tab, then click "Use as project URL" to persist the detected port so "View Running Project" works without manual port entry.
