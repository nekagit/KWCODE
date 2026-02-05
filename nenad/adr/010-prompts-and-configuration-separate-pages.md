# ADR 010: Prompts and Configuration as separate pages

## Status

Accepted.

## Context

Prompts selection and timing/scripts configuration were previously combined in a single tab ("Prompts & timing") on the dashboard. Users requested a clearer separation: a dedicated **Prompts** page and a **Configuration** page for scripts and timings.

## Decision

- **Prompts page** (`/prompts`): Dedicated page for selecting prompt IDs and starting/stopping runs. Run controls (Start/Stop) use the shared run state (selected prompts, active projects, timing from context).
- **Configuration page** (`/configuration`): Dedicated page for:
  - **Scripts**: List of files in `script/` (via Tauri `list_scripts`), with short description of `run_prompts_all_projects.sh`.
  - **Timing**: All sleep/env inputs (after open project, after window focus, between Shift+Tabs, etc.) in a grid layout.
- **Navigation**: Root layout provides a shared shell (sidebar) with three main links: **Dashboard** (`/`), **Prompts** (`/prompts`), **Configuration** (`/configuration`). Dashboard keeps sub-tabs: Dashboard, Projects, Tickets, Feature, AI Generate, Data, Log.
- **Shared state**: Introduced `RunStateProvider` (React context) so that timing, selected prompt IDs, prompts list, active projects, and run/stop handlers are shared across Dashboard, Prompts, and Configuration. This allows editing timing on Configuration and running from Prompts or from a Feature on the Dashboard without losing configuration.

## Consequences

- Clearer information architecture: prompts vs configuration are distinct pages.
- Configuration (timing, script list) is easy to find and edit in one place.
- Run state is centralized; no duplicate timing or prompt state between pages.
- Dashboard Quick actions include a "Prompts" button that navigates to `/prompts`.
- "View log" from the running-terminals widget links to `/?tab=log` so the user lands on the Log tab.
