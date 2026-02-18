# ADR 0105 — Fast development: auto-ensure General Development milestone

## Status

Accepted.

## Context

When using **Fast development** (Worker tab) and pressing Enter to run the terminal agent, the app creates a ticket and then runs the agent. The flow requires a milestone for the ticket. If the project had no milestones yet, the user saw: "No milestone found. Add a milestone in the Milestones tab (e.g. General Development)." This blocked quick usage of fast dev without first opening the Milestones tab.

## Decision

- **Tauri backend:** In `get_milestones_for_project` (db.rs), after loading milestones for a project, if there is no milestone named "General Development", insert one (name "General Development", slug "general-development") and re-query. Return the list including the new milestone.
- This matches the existing behavior of the Next.js API GET `/api/data/projects/[id]/milestones`, which already ensures "General Development" exists when listing milestones.
- No frontend change: the fast-development flow continues to require a milestone for the ticket; it now always receives at least one from the backend.

## Consequences

- Pressing Enter in Fast development works even when the project has no milestones yet; the user is no longer prompted to add a milestone first.
- New projects get a default "General Development" milestone on first use of fast dev (or first fetch of milestones in Tauri).
- Behavior is consistent between Tauri (desktop) and browser mode (API already ensured the default).
