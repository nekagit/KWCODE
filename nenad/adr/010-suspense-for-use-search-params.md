# ADR 010: Suspense for useSearchParams

## Status

Accepted.

## Context

The app showed a React render stack trace involving `Home`, `renderWithHooks`, and `updateFunctionComponent`. In the Next.js App Router, `useSearchParams()` from `next/navigation` is a dynamic API: during static or initial render, search params may not be available yet. Using it in client components (e.g. `Home` in `page.tsx` and `AppShell` in `app-shell.tsx`) without a Suspense boundary can cause render-time errors or warnings.

## Decision

- Wrap the part of the tree that uses `useSearchParams()` in a `<Suspense>` boundary.
- In the root layout, wrap `<AppShell>{children}</AppShell>` in `<Suspense>` with a loading fallback (spinner + “Loading…”).
- Keep `RunStateProvider` outside Suspense so provider state is available when the suspended content mounts.

## Consequences

- Next.js can safely resolve search params while showing the fallback UI.
- The render stack error related to `Home` / hooks should be resolved.
- Users may briefly see the Suspense fallback on first load when the URL has query params.
