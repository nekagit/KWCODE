# ADR 0298: Project Milestones tab — Open project's milestones folder in file manager

## Status

Accepted.

## Context

The project detail Milestones tab shows milestones and export/copy actions. The command palette has "Open milestones folder in file manager", which opens the **app repo's** `.cursor/milestones` folder. There was no way to open the **current project's** `.cursor/milestones` folder from the Milestones tab. Users had to use the command palette or open the project folder and navigate manually.

## Decision

- Add a lib **`open-project-milestones-folder.ts`** with `openProjectMilestonesFolderInFileManager(repoPath)`. It invokes existing Tauri `open_path_in_file_manager` with `repoPath/.cursor/milestones`. Tauri only; toasts in browser.
- In **ProjectMilestonesTab**, when `project.repoPath` is set and `isTauriEnv === true`, add an **Open folder** button (FolderOpen icon, outline, sm):
  - In the "Milestones files" SectionCard header (when the card is shown).
  - In the toolbar row with Export JSON / Copy JSON (when there are milestones).
- No new Tauri commands; reuse `open_path_in_file_manager`. If the folder does not exist, the backend returns an error and the frontend shows the toast.

## Consequences

- Users can open the project's milestones folder from the Milestones tab without using the command palette.
- Parity with project header "Open folder" / "Open .cursor folder" and with Ideas/Technologies page "Open folder".
- If the project has no `.cursor/milestones` yet, the user sees an error toast; they can create the folder or open the project root.
