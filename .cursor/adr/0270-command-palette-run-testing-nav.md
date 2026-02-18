# ADR 0270 — Command palette Run and Testing nav entries

## Status

Accepted.

## Context

- The sidebar (ADR 0268) lists Run and Testing in the Work section, linking to `/run` and `/testing`.
- The command palette exposes "Go to Run" and "Go to Testing" as actions (redirect to first project's Worker/Testing tab) but does not include **Run** and **Testing** in its navigation list (`NAV_ENTRIES`).
- Users opening the palette to navigate see Dashboard, Ideas, Technologies, Projects, Prompts, Database, etc., but not Run or Testing as direct nav targets.

## Decision

- Add **Run** and **Testing** to the command palette's `NAV_ENTRIES`.
- **Run:** `href="/run"`, label "Run", icon `Activity`.
- **Testing:** `href="/testing"`, label "Testing", icon `TestTube2`.
- Place after Prompts so the palette nav order matches the sidebar Work section: Projects, Prompts, Run, Testing.
- Reuse existing `/run` and `/testing` redirect pages; no new routes.

## Consequences

- Users can open the command palette (⌘K) and select "Run" or "Testing" to go to the redirect pages, consistent with the sidebar.
- The palette's navigation list now aligns with the sidebar for Run and Testing; "Go to Run" / "Go to Testing" remain as actions with the same redirect behaviour.
