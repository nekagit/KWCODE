# ADR 0006: Molecules useEffect cleanup and optimization

## Status

Accepted

## Context

Molecules in `src/components/molecules` use `useEffect` for fetch-on-mount and load-on-selection. Several effects performed async work (API or Tauri calls) without cleanup. When the component unmounts or dependencies change before the promise resolves, `setState` can run on an unmounted component, causing React warnings and potential leaks. Best practice for AI-assisted and long-lived apps is to avoid updates after unmount and to make async effects cancellable.

## Decision

1. **Add cancellation to all async effects in molecules**
   - For effects that only call a single async function (e.g. `fetchData()`, `fetchDoc()`, `loadAll()`): introduce an optional `getIsCancelled?: () => boolean` argument. The effect sets a ref to `false`, calls the fetcher with `() => ref.current`, and returns a cleanup that sets the ref to `true`. The fetcher checks `getIsCancelled?.()` before every `setState` after await.
   - For effects that inline async logic (e.g. `ProjectRunTab` queue/preview, `LocalReposSection`): use a local `let cancelled = false`, guard every `setState` in `.then`/`.catch`/`.finally` with `if (!cancelled)`, and return `() => { cancelled = true }` from the effect.

2. **Keep dependency arrays and `useCallback` as-is**
   - No change to dependency arrays or to when effects re-run; only add cleanup to avoid post-unmount updates.

3. **Document the pattern**
   - Document the cancellation pattern in `.cursor/documentation` so future components and AI assistants follow the same approach.

## Components updated

| Component | Change |
|-----------|--------|
| `ProjectRunTab` | Cancelled flag in both effects (queue/workflows list, preview content). |
| `ProjectBackendTab` | `cancelledRef` + `fetchData(getIsCancelled)` with cleanup. |
| `ProjectFrontendTab` | Same as Backend. |
| `ProjectSetupTab` | `cancelledRef` + `loadAll(getIsCancelled)` with cleanup. |
| `SetupDocBlock` | `cancelledRef` + `fetchDoc(getIsCancelled)` with cleanup. |
| `ProjectSetupDocTab` | Same as SetupDocBlock. |
| `ProjectAgentsSection` | `cancelledRef` + `fetchAgents(getIsCancelled)` with cleanup. |
| `ProjectFilesTab` | `cancelledRef` + `fetchFiles(getIsCancelled)` with cleanup. |
| `ProjectGitTab` | `cancelledRef` + `fetchGitInfo(getIsCancelled)` with cleanup. |
| `LocalReposSection` | Local `cancelled` in effect, guard `apply`/`done` and return cleanup. |

Components that already had cancellation (e.g. `DatabaseDataTabContent`, `DashboardMetricsCards`, `ProjectMilestonesTab`) were left unchanged.

## Consequences

- **Fewer React warnings:** No setState on unmounted components from these effects.
- **Consistent pattern:** New async effects in molecules can follow the same ref + getIsCancelled or local cancelled flag approach.
- **Backward compatible:** Callers that invoke `fetchData()` or `fetchDoc()` without arguments (e.g. retry/reload buttons) still work; optional `getIsCancelled` is only used from the effect.

## References

- React: [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect) and effect cleanup.
- Conversation: molecules useEffect audit and optimization (Feb 2026).
