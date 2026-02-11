## 0017-implement-native-file-browsing-for-repo-path

### Status
Accepted

### Context
Users needed the ability to browse their local file system to select a repository path when creating a new project. The application is expected to run in a desktop environment, likely using Electron, which allows for native file dialog integration.

### Decision
To address this, the following changes were implemented:

1.  **Electron Utility (`src/lib/electron.ts`)**:
    *   A new file `src/lib/electron.ts` was created to provide a placeholder `showOpenDirectoryDialog` function. In a full Electron application, this function would interact with the Electron main process via `ipcRenderer` to open a native file dialog and return the selected path.

2.  **`ProjectInput` Component (`src/components/atoms/inputs/ProjectInput.tsx`)**:
    *   The `ProjectInput` component was modified to accept an optional `onBrowse` prop (`onBrowse?: () => void;`).
    *   A "Browse" button was added next to the input field, which is conditionally rendered if the `onBrowse` prop is provided. This button triggers the `onBrowse` callback when clicked.

3.  **`NewProjectForm` Component (`src/components/molecules/FormsAndDialogs/NewProjectForm.tsx`)**:
    *   The `showOpenDirectoryDialog` function from `src/lib/electron.ts` was imported.
    *   A new asynchronous function `handleBrowseRepoPath` was created. This function calls `showOpenDirectoryDialog` and, if a path is selected, updates the `repoPath` state with the chosen directory.
    *   The `onBrowse` prop of the `ProjectInput` component for the "Repo path" was set to `handleBrowseRepoPath`.

### Consequences
This implementation provides a mechanism for users to browse their file system and select a repository path using a native file dialog. While the `src/lib/electron.ts` currently contains a mock implementation, it establishes the necessary structure for integrating with Electron's `dialog.showOpenDialog` in a production environment. This enhances the user experience by simplifying the process of specifying repository paths.
