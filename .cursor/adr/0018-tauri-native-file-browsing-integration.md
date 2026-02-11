## 0018-tauri-native-file-browsing-integration

### Status
Accepted

### Context
Initially, the application was assumed to be an Electron app, and a placeholder for Electron's IPC was implemented for native file browsing. However, it was clarified that the application is built with Tauri, requiring a different approach for native dialog integration.

### Decision
To integrate native file browsing for the "Repo path" in the `NewProjectForm` within a Tauri application, the following adjustments were made:

1.  **Renamed Utility File**:
    *   `src/lib/electron.ts` was renamed to `src/lib/tauri.ts` to reflect the correct framework.

2.  **Updated Tauri Utility Function**:
    *   The `showOpenDirectoryDialog` function in `src/lib/tauri.ts` was modified to use Tauri's `dialog.open` API. This function now imports `open` from `@tauri-apps/api/dialog` and calls it with `directory: true` to enable native directory selection.

3.  **Updated `NewProjectForm` Import**:
    *   The `NewProjectForm` component (`src/components/molecules/FormsAndDialogs/NewProjectForm.tsx`)'s import statement for `showOpenDirectoryDialog` was updated to reference `"@/lib/tauri"` instead of `"@/lib/electron"`.

### Consequences
These changes correctly integrate native file browsing functionality into the `NewProjectForm` for Tauri applications. Users can now click the "Browse" button to open a native directory selection dialog provided by Tauri, allowing them to choose a local folder for their project repository. This provides a better user experience by eliminating the need for manual path input and resolving the previous mock path behavior.
