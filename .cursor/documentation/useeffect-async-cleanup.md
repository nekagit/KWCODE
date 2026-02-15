# useEffect and async cleanup (molecules)

When a molecule (or any component) runs async work inside `useEffect`, the effect should avoid calling `setState` after the component has unmounted or after the effect has been cleaned up. Otherwise React may log warnings and you can get subtle bugs.

## Pattern 1: Effect calls a single async function

Use a ref and an optional **getIsCancelled** callback passed into the fetcher:

```tsx
const cancelledRef = useRef(false);

const fetchData = useCallback(async (getIsCancelled?: () => boolean) => {
  if (!getIsCancelled?.()) setLoading(true);
  try {
    const raw = await readSomething();
    if (getIsCancelled?.()) return;
    setData(raw);
  } catch (e) {
    if (!getIsCancelled?.()) setError(e.message);
  } finally {
    if (!getIsCancelled?.()) setLoading(false);
  }
}, [/* deps */]);

useEffect(() => {
  cancelledRef.current = false;
  fetchData(() => cancelledRef.current);
  return () => {
    cancelledRef.current = true;
  };
}, [fetchData]);
```

- Callers that don’t pass `getIsCancelled` (e.g. a “Retry” button) still work: `getIsCancelled?.()` is undefined and the guards are skipped.
- The effect cleanup sets the ref to `true` so in-flight work won’t call `setState` after unmount.

## Pattern 2: Async logic inline in the effect

Use a local **cancelled** flag and guard every state update in `.then` / `.catch` / `.finally`:

```tsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchSomething()
    .then((res) => {
      if (!cancelled) setData(res);
    })
    .catch(() => {
      if (!cancelled) setError("Failed");
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
  return () => {
    cancelled = true;
  };
}, [dep1, dep2]);
```

## When to use which

- **Pattern 1:** When the async logic lives in a `useCallback` (e.g. `fetchData`, `fetchDoc`, `loadAll`) that may also be called from event handlers. Keeps one implementation and adds cancellation for the effect only.
- **Pattern 2:** When the effect contains a short, one-off async flow (e.g. one `fetch` or `Promise.all`) and you don’t need to reuse it elsewhere.

## References

- ADR: [.cursor/adr/0006-molecules-useeffect-cleanup.md](../adr/0006-molecules-useeffect-cleanup.md)
