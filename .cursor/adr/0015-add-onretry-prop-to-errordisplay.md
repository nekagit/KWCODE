1. Context
    A linter error was reported in `src/components/organisms/ProjectsListPageContent.tsx` because the `ErrorDisplay` component was being passed an `onRetry` prop, but the `ErrorDisplayProps` interface did not include it.

2. Decision
    The `ErrorDisplayProps` interface in `src/components/shared/ErrorDisplay.tsx` was updated to include an optional `onRetry` prop. The `ErrorDisplay` component was also modified to conditionally render a "Retry" button that invokes the `onRetry` function when provided.

3. Status
    Completed.

4. Consequences
    The linter error has been resolved. The `ErrorDisplay` component now correctly accepts and utilizes the `onRetry` prop, allowing for better error handling and user experience in components that use it.