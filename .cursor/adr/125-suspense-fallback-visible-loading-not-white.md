# ADR 125: White screen fix – isolate useSearchParams, no root fallback

## Status

Accepted.

## Context

After ADR 122, the root layout wrapped `AppShell` in `Suspense` with a minimal fallback so the first React commit could complete when `AppShell` suspended (e.g. due to `useSearchParams()`). That fallback was an empty div, so users saw a **white screen**. The user requested fixing the underlying errors with no fallback.

## Decision

1. **Isolate `useSearchParams` in AppShell**  
   `AppShell` no longer calls `useSearchParams()` at the top level. A small component `SidebarNavWithParams` reads search params (for home tab highlighting) and is wrapped in its own `<Suspense>` inside the sidebar, with a minimal fallback that only affects the nav (default tab "dashboard"). The rest of the shell (pathname, run state, sidebar layout, main area) renders without suspending.

2. **Remove root Suspense in layout**  
   The root layout no longer wraps `AppShell` in `Suspense`. The shell renders immediately; only the sidebar nav’s tab highlight can briefly use the fallback, and page content (e.g. Home) is already inside `<Suspense fallback={null}>{children}</Suspense>` in the main area.

## Consequences

- No full-screen fallback: the app shell (sidebar, header, main frame) appears immediately.
- `useSearchParams()` only runs inside a local Suspense boundary in the sidebar, so the root never blocks on search params.
- Page content that uses `useSearchParams()` (e.g. home page) can still suspend; the main area shows nothing until it resolves, but the shell is visible.
