# ADR 076: Project details page – fix setState during render (HotReload warning)

## Status

Accepted.

## Context

In development, the project details page (`/projects/[id]`) triggered:

```
Cannot update a component (`HotReload`) while rendering a different component (`ProjectDetailsPage`).
To locate the bad setState() call inside `ProjectDetailsPage`, follow the stack trace...
```

React forbids updating another component’s state during render. Radix UI `Dialog` can call `onOpenChange` during its render (e.g. when syncing controlled state). If that callback calls our `setState` (e.g. `setDetailModalItem(null)` or `closeAnalysisDialog()`), that update can occur while `ProjectDetailsPage` is still rendering and can lead to React updating the Next.js dev `HotReload` component in the same pass, causing the warning.

## Decision

- Defer all Dialog `onOpenChange` handlers on the project details page so that they never run synchronously during render.
- Use `queueMicrotask(() => setState(...))` (or call a close function inside `queueMicrotask`) so the state update runs after the current render commit.
- Applied to:
  - Detail modal: `onDetailModalOpenChange` → `setDetailModalItem(null)` in microtask.
  - Best practice dialog: `onBestPracticeOpenChange` → `setBestPracticeOpen(open)` in microtask.
  - Analysis dialog: `onAnalysisDialogOpenChange` → `closeAnalysisDialog()` in microtask.

## Consequences

- The HotReload / “Cannot update a component while rendering a different component” warning in dev should stop.
- Dialog open/close behavior is unchanged from the user’s perspective; only the timing of the state update is deferred by one microtask.
- Same pattern can be reused elsewhere if similar warnings appear with Radix Dialog or other controlled components.
