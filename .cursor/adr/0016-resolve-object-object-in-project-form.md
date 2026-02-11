## 0016-resolve-object-object-in-project-form

### Status
Accepted

### Context
Users were unable to create new projects due to `[object Object]` appearing in the "Name" and "Repo Path (Optional)" input fields of the `NewProjectForm` component. This occurred because the `onChange` prop of the `ProjectInput` component was directly receiving state setter functions (`setName`, `setRepoPath`) instead of a function that extracts the target value from the event object.

### Decision
The `onChange` props for the `ProjectInput` components within `src/components/molecules/FormsAndDialogs/NewProjectForm.tsx` were updated to wrap the state setter functions in an arrow function that correctly extracts `event.target.value`.

Specifically, the following changes were made:
- `onChange={setName}` was changed to `onChange={(e) => setName(e.target.value)}` for the "Name" input.
- `onChange={setRepoPath}` was changed to `onChange={(e) => setRepoPath(e.target.value)}` for the "Repo path (optional)" input.

### Consequences
This change resolves the `[object Object]` display issue, allowing users to correctly input text into the project creation form and successfully create new projects. The `ProjectInput` component now receives the expected string values, ensuring proper rendering and functionality.
