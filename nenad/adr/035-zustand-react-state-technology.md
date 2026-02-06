# ADR 035: Zustand as React state technology

## Status

Accepted.

## Context

The app used React Context (`RunStateProvider` + `useRunState`) for run-related global state (projects, prompts, timing, runs, Tauri env). Context causes all consumers to re-render on any state change and adds Provider boilerplate. We wanted a modern, minimal state solution that fits Next.js 15 and keeps the same public API for consumers.

## Decision

- **Adopt Zustand** as the primary client state technology.
  - Zustand: minimal API, no Provider, selective subscriptions via `useShallow`, small bundle, strong TypeScript support, widely recommended for React client state.
- **Run state migration**
  - Add `src/store/run-store.ts`: Zustand store with the same state and actions as the previous context value (run script, stop, timing, projects, prompts, etc.).
  - Add `src/store/run-store-hydration.tsx`: client component that runs side effects (Tauri env detection, initial data load, `script-log` / `script-exited` listeners). Mount once in root layout.
  - Expose `useRunState()` from the store (same API as before) using `useShallow` so consumers keep the same hook interface.
  - Keep `src/context/run-state.tsx` as a thin re-export of `useRunState` and `RunStoreHydration` so existing imports from `@/context/run-state` continue to work.
- **Layout**
  - Replace `RunStateProvider` with `RunStoreHydration` in `src/app/layout.tsx`. No wrapper needed; hydration runs effects and updates the store.
- **ADR**
  - Document in `nenad/adr/` and `.cursor/adr/`.

## Consequences

- Run state is managed by Zustand; fewer unnecessary re-renders when using selective selectors elsewhere (e.g. `useRunStore(s => s.timing)`).
- No Provider wrapper; layout is simpler.
- Existing `useRunState()` call sites work unchanged; new code can use `useRunStore` with custom selectors for finer-grained subscriptions.
- Future global client state can follow the same pattern (new stores under `src/store/`). Server state (API data) can be handled separately (e.g. TanStack Query) if needed.
