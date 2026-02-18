# ADR 0190 — Dashboard page: visible tab list

## Status

Accepted.

## Context

The Home page ("/") has five tabs (Dashboard, Projects, Prompts, Database, Data) and persists the last selected tab in localStorage (ADR 0126). The tab content was rendered via Radix `Tabs` and `TabsContent`, but **no `TabsList` or `TabsTrigger` components were rendered**. As a result, users saw only the content of whichever tab was active (e.g. "Active repos" when the restored tab was "projects") with no way to switch back to the full Dashboard view. The "old" dashboard (overview, metrics, quick links, project cards) was still in the code under the "dashboard" tab but unreachable because the tab bar was missing.

## Decision

- In **HomePageContent.tsx**, add a **TabsList** with **TabsTrigger** for each of the five tab values: `dashboard`, `projects`, `prompts`, `all`, `data`.
- Use **DASHBOARD_TAB_TITLES** from `@/context/page-title-context` for trigger labels so document title and tab bar stay in sync.
- Place the TabsList at the top of the home page content (inside the same flex container as the tab content), with `aria-label="Dashboard sections"` and `data-testid` on triggers for tests.

## Consequences

- Users can always see and switch between Dashboard, Projects, Prompts, Database, and Data from the Home page.
- The full dashboard (overview strip, entity links, project cards) is reachable by clicking the "Dashboard" tab.
- Tab persistence (ADR 0126) remains; the restored tab is still applied on navigate to "/", but users can immediately switch to any other tab via the visible tab list.
