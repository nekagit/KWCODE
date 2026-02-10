# ADR 122: App stuck on loading – Suspense and fallback hide

## Status

Accepted.

## Context

The app sometimes showed the root loading overlay (“Loading Run Prompts Control…”) indefinitely and never rendered the shell or page content.

- In Next.js App Router, `useSearchParams()` in client components (e.g. `AppShell`, home `page.tsx`) can **suspend** until search params are available.
- The root layout rendered `RootLoadingOverlay` then the rest of the tree (including `AppShell`). When `AppShell` suspended, the **first React commit never completed**, so `RootLoadingOverlay`’s `useEffect` (which sets `loaded` to hide the overlay) never ran.
- ADR 010 already required a Suspense boundary around the tree that uses `useSearchParams`; the layout had not been updated to wrap `AppShell` at the root.
- If the client bundle failed to load (e.g. wrong origin, 404), the overlay would also stay visible with no way to hide it (ADR 048 had removed the inline hide script).

## Decision

1. **Suspense around AppShell in root layout**  
   Wrap `<AppShell>{children}</AppShell>` in `<Suspense fallback={…}>` in the root layout. The fallback is a minimal placeholder (`<div className="min-h-screen flex-1" aria-hidden />`) so the first commit can complete without waiting for search params. Once the commit completes, `RootLoadingOverlay`’s `useEffect` runs and the overlay hides; then the suspended content (shell + page) resolves and fills in.

2. **Client-side timeout in RootLoadingOverlay**  
   In `RootLoadingOverlay`, add a second `useEffect` that calls `setLoaded(true)` after 5 seconds. If something else delays the first commit (e.g. slow network, other suspend), the overlay still disappears and the user is not stuck.

3. **Optional inline script fallback**  
   In the layout `<head>`, add a small inline script that after 8 seconds sets `data-loaded="true"` on `#root-loading`. This covers the case where the React app never loads (e.g. JS 404 or error before hydration), so the user is not left on a loading screen forever. This partially reverts the “no inline hide script” from ADR 048 in favor of a single, long timeout as a last resort.

## Consequences

- The loading overlay hides as soon as the first client commit completes (typically immediately after mount), or after at most 5 seconds from the client, or after 8 seconds if React never runs.
- Root layout aligns with ADR 010: the part of the tree that uses `useSearchParams()` is inside a Suspense boundary so the rest of the app (including overlay hide) can render.
- Users may briefly see an empty main area (Suspense fallback) before the shell and page content appear when the URL has query params; the root overlay still hides so the app no longer appears “stuck loading”.
