1. **Context**

Previously, there were multiple specific header components in `src/components/shared` such as `ProjectDesignHeader.tsx`, `ProjectFeatureHeader.tsx`, `ProjectIdeaHeader.tsx`, `ProjectPromptRecordHeader.tsx`, and `ProjectTicketsHeader.tsx`. These components shared a lot of common logic and structure, leading to code duplication. Additionally, there were empty folders like `badges`, `displays`, `forms`, and `inputs` that were no longer needed.

2. **Decision**

The decision was made to refactor these specific header components into a single, generic `ProjectHeader.tsx` component. This new component is designed to accept props that allow it to dynamically display the category name, icon, length, and actions (new item link, export functionality).

Furthermore, the unused and empty folders `badges`, `displays`, `forms`, and `inputs` in `src/components/shared` were removed to streamline the project structure.

3. **Consequences**

*   **Improved Code Reusability**: By consolidating the specific headers into a single generic `ProjectHeader` component, code duplication is significantly reduced, making the codebase more maintainable and easier to understand.
*   **Simplified Project Structure**: The removal of redundant header files and empty folders cleans up the `src/components/shared` directory, making it more organized and easier to navigate.
*   **Centralized Header Logic**: All header-related logic is now managed in one place, simplifying future updates or modifications to header functionalities.
*   **Reduced Bundle Size**: Eliminating redundant files can contribute to a slightly smaller application bundle size.
*   **Migration Effort**: Existing usages of the specific header components had to be updated to use the new `ProjectHeader` component and pass the appropriate props. This was done by identifying all call sites and adjusting the imports and component usage.
