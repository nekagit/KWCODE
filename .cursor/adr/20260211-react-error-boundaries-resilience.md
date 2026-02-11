# React error boundaries for resilience (#5)

## Status
Accepted (2026-02-11)

## Context
Ticket #5 (Resilience): "Add React error boundaries — Catch component errors and show fallback UI so one throw does not blank the app." The app already had Next.js `error.tsx` (segment-level) and `global-error.tsx` (root), but a single thrown error in a deep child could still replace the entire segment or root UI. There was no reusable, section-level boundary to isolate failures (e.g. Kanban parsing, run page, project detail).

## Decision
1. **Reusable ErrorBoundary component**  
   Add a client-side `ErrorBoundary` in `src/components/ErrorBoundary.tsx`. Implemented as a **class component** (React error boundaries require `getDerivedStateFromError` / `componentDidCatch`, which are only supported in class components). Props: `children`, optional `fallback`, optional `fallbackTitle`, optional `onReset`. Default fallback uses existing `ErrorDisplay` (role="alert", Retry button). In development, stack trace is shown in `details`.

2. **AppShell main content**  
   Wrap the main content area (inside the existing `Suspense` in AppShell) with `ErrorBoundary`. Any uncaught error in page content then shows a fallback in the main area only; the sidebar remains usable.

3. **Section-level boundaries**  
   Wrap high-risk organisms so one failing section does not blank the whole page:
   - **TicketBoard**: Kanban (parsing, drag-and-drop, many cards).
   - **RunPageContent**: Run controls, feature queue, prompt/project selection.
   - **ProjectDetailsPageContent**: Tabs, project header, tickets/features/prompts/design/ideas/architecture.

4. **No new dependencies**  
   Use a single in-repo class-based ErrorBoundary; no `react-error-boundary` package.

## Consequences
- A thrown error in one section (e.g. Kanban) shows a localized fallback with "Try again" instead of blanking the app.
- Sidebar and navigation stay visible when page content errors.
- Existing `error.tsx` and `global-error.tsx` remain for route and root-level errors.
- ErrorBoundary is reusable for future high-risk sections (e.g. home tabs, configuration).
