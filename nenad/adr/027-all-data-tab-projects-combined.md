# ADR 027: All data tab – combined projects, prompts, tickets, features, ideas, design

## Status

Accepted.

## Context

Users wanted a single “big project page” that shows all relevant data in one place: projects, design, ideas, prompts, tickets, and features, instead of switching between tabs and pages.

## Decision

- **New tab “All data”** on the dashboard (`/?tab=all`), added to `VALID_TABS` and to the sidebar nav (label “All data”, icon `LayoutGrid`).
- **Single combined view** with six sections in a grid layout:
  1. **Projects**: All projects list with checkboxes for active; “Save active” writes cursor_projects.json. Same behavior as Projects tab in compact form.
  2. **Prompts**: List of prompts with checkboxes for selection (for Run). Links to Prompts page for editing.
  3. **Tickets**: First 30 tickets with status badge and title. Points to Tickets tab for full list.
  4. **Features**: All features with title and counts (prompt_ids, project_paths). Points to Feature tab for configuration.
  5. **Ideas**: Fetched from `/api/data/ideas` when the tab is active. Shows title, description snippet, category. Link to Ideas page.
  6. **Design**: Short description and link to Design page for config and markdown generation.
- **Ideas** are loaded only when `tab === "all"` via `useEffect` and `/api/data/ideas`; state `ideas` and `ideasLoading` added to the home page.

## Consequences

- One place to see and act on projects, prompts, tickets, features, ideas, and design entry point.
- Projects and prompts remain interactive (toggle active, select for run); other sections are read-only summaries with links to dedicated pages.
- Ideas are API-backed; in browser mode they come from data/ideas.json via the API.
