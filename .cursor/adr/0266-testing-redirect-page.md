# ADR 0266 — Testing redirect page at /testing

## Status

Accepted.

## Context

- The app has "Go to Testing" (⌘⇧Y) and a command palette action that navigate to the first active project's Testing tab via `goToTesting()`.
- The Dashboard has a Testing quick link (button) that does the same.
- There was no global `/testing` route: direct links or bookmarks to "testing" would 404.
- The `/run` redirect page (ADR 0265) already provides the same pattern for the Run (Worker) tab.

## Decision

- Add a dedicated **Testing redirect page** at `src/app/testing/page.tsx`.
- The page is a client component that on mount:
  - Reads `activeProjects` from the run store.
  - If empty: toast "Select a project first", then `router.replace("/projects")`.
  - Otherwise: calls `listProjects()`, finds the project whose `repoPath` matches `activeProjects[0]`, then `router.replace(\`/projects/${id}?tab=testing\`)`.
  - If no matching project or list fails: toast and redirect to `/projects`.
- While resolving, the page shows "Redirecting to Testing…".
- Logic mirrors CommandPalette `goToTesting` and the Dashboard Testing button so behaviour is consistent with `/run`.

## Consequences

- Users can bookmark or share `/testing` and get the same behaviour as ⌘⇧Y or the Dashboard Testing button.
- Parity with the `/run` redirect page; same pattern for both Run and Testing.
- No new dependencies; uses existing `useRunState`, `listProjects`, and Next.js `useRouter`.
