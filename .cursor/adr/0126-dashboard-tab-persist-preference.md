# ADR 0126 — Dashboard (Home): Persist tab preference

## Status

Accepted.

## Context

The Home page (Dashboard) has five tabs: Dashboard, Projects, Prompts, All data, and Database. The app already wrote the selected tab to localStorage (`kwcode-dashboard-tab`) when the user changed tabs, but when the user navigated to "/" without a `?tab=` query, the app always showed the default "Dashboard" tab and never read the saved value. Other pages (Ideas, Projects list, Prompts) persist and restore view preferences; the Home page persistence was incomplete.

## Decision

- **No new lib module** — Keep using the existing `DASHBOARD_TAB_STORAGE_KEY` in **HomePageContent**. Add a **useEffect** that runs on the client: when `searchParams.get("tab")` is missing or empty, read `localStorage.getItem(DASHBOARD_TAB_STORAGE_KEY)`; if the value is one of the valid tab values (`dashboard`, `projects`, `prompts`, `all`, `data`) and is not `"dashboard"`, call **`router.replace("/?tab=" + saved)`** so the URL and visible tab reflect the last choice.
- SSR-safe: only read localStorage when `typeof window !== "undefined"`; no redirect during SSR.

## Consequences

- Returning to the Home page ("/") without a tab query restores the user’s last selected tab, matching the UX of Ideas, Projects list, and Prompts.
- Preference remains in localStorage; no backend or API changes. Direct links with `?tab=...` continue to work and take precedence.
