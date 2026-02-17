# ADR 0080: Control tab — avoid window.location.href in Tauri to fix "expected pattern" error

## Status

Accepted.

## Context

In the **build** (desktop/Tauri) version of KWCode, the Control tab (and surrounding project-detail flows) could still show **"The string did not match the expected pattern"**. ADR 0071 removed URL parsing from the Rust `navigate_webview_to` command and recommended client-side navigation only. Two frontend code paths were still using `window.location.href = "/projects"` after deleting a project:

1. **ProjectDetailsPageContent**: when `onBack` was not set (e.g. on route `/projects/[id]`), after delete it did `else window.location.href = "/projects"`.
2. **ProjectHeader**: after delete it always did `window.location.href = "/projects"`.

Setting `window.location.href` to a path in the Tauri WebView resolves against the current origin (e.g. `asset://...`). The WebView’s internal URL handling can still surface the same parse error for that resolved URL, so the error continued to appear when users deleted a project from the project-detail page (including when the Control tab was active).

## Decision

- **ProjectDetailsPageContent**: When navigating back to the list after delete and `onBack` is not provided, use **client-side navigation** via `router.replace("/projects")` instead of `window.location.href = "/projects"`. Use `useRouter` from `next/navigation`.
- **ProjectHeader**: After delete, use **client-side navigation** via `router.replace("/projects")` instead of `window.location.href = "/projects"`. Use `useRouter` from `next/navigation`.

This keeps all app-internal navigation off `window.location.href` in Tauri, so the "expected pattern" URL parse error is not triggered.

## Consequences

- "The string did not match the expected pattern" no longer appears in the desktop build when using the Control tab and deleting a project or when navigating back after delete.
- Aligns with ADR 0071 and 0067: app-internal routes use the Next.js router only in Tauri.

## References

- ADR 0071 — Navigate WebView use eval for non-http(s) URLs
- ADR 0067 — Desktop project link client-side navigation
- `src/components/organisms/ProjectDetailsPageContent.tsx` — delete handler and `useRouter`
- `src/components/molecules/LayoutAndNavigation/ProjectHeader.tsx` — delete handler and `useRouter`
