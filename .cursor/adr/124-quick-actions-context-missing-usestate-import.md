# ADR 124: Quick actions context – missing useState import (500 on main-app.js)

## Status
Accepted

## Context
The app was returning 500 (Internal Server Error) for `main-app.js` and `app-pages-internals.js`. Those are Next.js client bundles; a 500 on them usually indicates a server-side or client hydration failure that surfaces as a failed resource load.

## Decision
In `src/context/quick-actions-context.tsx`, `QuickActionsProvider` used `useState` (lines 85–86) but `useState` was not imported from `react`. The import only included `createContext`, `useCallback`, and `useContext`. At runtime this caused a `ReferenceError` (useState is not defined), crashing the app during initial load/hydration and leading to 500 responses for the page/JS resources.

Added `useState` to the React import in `quick-actions-context.tsx`.

## Consequences
- App loads without 500s for main-app.js and app-pages-internals.js.
- Quick actions (FAB, Log/Run/Config modals) continue to work as before with correct React hook usage.
