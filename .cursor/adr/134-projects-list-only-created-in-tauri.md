# 134 – Projects list shows only created projects (Tauri)

## Status

Accepted.

## Context

On the Projects page, in Tauri mode, `listProjects()` was implemented by calling `list_february_folders` and mapping each folder path to a synthetic `Project` (id = path, name = last path segment, empty arrays for promptIds/ticketIds/featureIds/ideaIds). That made every subfolder of Documents/February appear as a project card (e.g. KW-FEBRUARY-AIADVENTUREGAME, KW-FEBRUARY-AIISO, KW-FEBRUARY-AITRELLO, KW-FEBRUARY-CASAPETRADA). Users expect the “Your projects” list to show only **created** projects, not every folder on disk.

## Decision

- **Tauri:** `listProjects()` now returns an empty array. The “Your projects” section therefore shows no cards until the user has created projects (when/if Tauri gains a project store, e.g. data/projects.json or DB). Local February folders remain available in the separate “Local repos” section (`LocalReposSection`) for creating a project from a path.
- **Non-Tauri (e.g. Next dev):** Behavior unchanged; projects are still loaded from `GET /api/data/projects` (e.g. `data/projects.json`).

## Consequences

- In Tauri, the Projects page no longer shows folder-based cards; only created projects would appear once a project store exists.
- Local repos are still listed in “Local repos” for quick project creation from a path.
- No Rust changes; frontend-only change in `src/lib/api-projects.ts`.
