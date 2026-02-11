1. Title: Resolving PopoverPortal Runtime Error and Missing Component Files

2. Status: Accepted

3. Context:
   The application encountered a series of build and runtime errors related to missing React components and incorrect usage of Shadcn UI's Popover component.

   - **Missing Files:**
     - `src/components/atoms/headers/ThemeNameHeader.tsx`
     - `src/components/atoms/headers/TitleWithIcon.tsx`
     These files were referenced in the codebase but did not exist, leading to build failures (Webpack Build Error: `Failed to read source code`).

   - **PopoverPortal Runtime Error:**
     The error `PopoverPortal` must be used within `Popover` indicated that `PopoverContent` was being rendered without being a child of a `Popover` component.
     Specifically, `src/components/organisms/Display/RunningTerminalsPopover.tsx` was directly exporting `PopoverContent`, while `src/components/molecules/Display/TerminalStatusBadge.tsx` was the intended parent `Popover` component.

   - **Type Definition Error:**
     A linter error `Module '"@/types/run"' has no exported member 'Run'` was identified, indicating a mismatch between the expected `Run` type and the actual `RunInfo` interface in `src/types/run.ts`.

4. Decision:
   To resolve these issues, the following actions were taken:

   - **Missing Files:**
     - Created `src/components/atoms/headers/ThemeNameHeader.tsx` with a basic functional component structure.
     - Created `src/components/atoms/headers/TitleWithIcon.tsx` with a basic functional component structure.

   - **PopoverPortal Runtime Error:**
     - Modified `src/components/molecules/Display/TerminalStatusBadge.tsx` to import and render `RunningTerminalsPopover` as a child within its `Popover` component.
     - Refactored `src/components/organisms/Display/RunningTerminalsPopover.tsx` to remove the direct `PopoverContent` wrapper and instead export the component that renders its children directly, expecting to be wrapped by `PopoverContent` from its parent.

   - **Type Definition Error:**
     - Renamed the `RunInfo` interface to `Run` in `src/types/run.ts` to align with its usage across the codebase and resolve the linter error.

5. Consequences:
   - The build errors due to missing component files are resolved.
   - The `PopoverPortal` runtime error is fixed, ensuring correct rendering of the popover.
   - The `Run` type definition error is resolved, improving type consistency.
   - The codebase now correctly adheres to the expected structure for Shadcn UI's Popover components.