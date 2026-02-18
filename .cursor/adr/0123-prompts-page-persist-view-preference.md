# ADR 0123 — Prompts page: Persist view preference

## Status

Accepted.

## Context

The Prompts page has a tab list (".cursor prompts", "General", and per-project tabs), and on the General tab a sort control (newest, oldest, title A–Z, title Z–A) and a filter-by-title input. When the user navigates away and returns, the selected tab, sort, and filter reset to defaults. The Ideas page and Projects list already persist their view preferences in localStorage (see `ideas-view-preference.ts` and `projects-list-view-preference.ts`); the Prompts page had no equivalent.

## Decision

- Add **`src/lib/prompts-view-preference.ts`** with storage key `kwcode-prompts-view-preference`. Persist **main tab** (`cursor-prompts` | `general`; project-specific tabs are not persisted), **sort** (`newest` | `oldest` | `title-asc` | `title-desc`), and **filter query** (string, max length 500). Export **`getPromptsViewPreference()`** and **`setPromptsViewPreference(partial)`**; validate values and cap filter length. SSR-safe: return defaults when `window` is undefined.
- In **PromptRecordsPageContent**, initialize **activeTab**, **promptSort**, and **filterQuery** from `getPromptsViewPreference()` in `useState` initializers (client-only). When the user changes tab via Tabs `onValueChange`, if the value is `cursor-prompts` or `general`, call `setPromptsViewPreference({ mainTab: value })`. On sort change, call `setPromptsViewPreference({ sort })`. On filter query change, debounce (300 ms) and call `setPromptsViewPreference({ filterQuery })`. The existing URL effect for `?projectId=...` continues to override activeTab when present.

## Consequences

- Returning to the Prompts page restores the user’s last main tab (when not opened via project link), sort, and filter, improving UX and matching the pattern used on the Ideas and Projects list pages.
- Preference is stored in localStorage; no backend or API changes.
