# ADR: Remove FEATURES and PROMPTS sections from project details Todo tab

## Date
2026-02-11

## Status
Accepted

## Context
The project details page "Todo" tab showed three columns: Tickets (main), FEATURES (sidebar), and PROMPTS (sidebar). The FEATURES and PROMPTS sections displayed empty states ("No features yet" / "No prompts yet") with "New feature" and "New prompt" actions. Product decision: remove these two sections from the Todo tab to simplify the project details view.

## Decision
- Remove `ProjectFeaturesTab` and `ProjectPromptRecordsTab` from the Todo tab in `ProjectDetailsPageContent.tsx`.
- Keep a single full-width column for `ProjectTicketsTab` (no grid; one card).
- Remove imports for `ProjectFeaturesTab` and `ProjectPromptRecordsTab` from the organism.
- Leave the tab component files (`ProjectFeaturesTab.tsx`, `ProjectPromptRecordsTab.tsx`) in the codebase; they are unused on this page but may be reused elsewhere (e.g. dedicated Features/Prompts pages or future layout).

## Consequences
- Todo tab shows only the Tickets (kanban) content; less visual clutter.
- Features and prompts for a project remain accessible via other routes (e.g. `/feature`, `/prompts`) if linked from elsewhere.
- If project-scoped features/prompts need to reappear on the project page, they can be re-added or moved to another tab.
