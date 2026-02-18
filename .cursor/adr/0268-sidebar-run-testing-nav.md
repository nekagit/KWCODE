# ADR 0268 — Sidebar Run and Testing nav items

## Status

Accepted.

## Context

- The Dashboard has quick links for Run and Testing (buttons that navigate to the first active project's Worker/Testing tab or to /projects with a toast).
- The command palette offers "Go to Run" and "Go to Testing" with the same behaviour; dedicated routes `/run` and `/testing` redirect accordingly (ADR 0265, 0266).
- The sidebar had no direct links to Run or Testing; users had to use the Dashboard, command palette, or keyboard shortcuts (⌘⇧W, ⌘⇧Y).

## Decision

- Add **Run** and **Testing** to the sidebar in the **Work** section.
- **Run:** `href="/run"`, label "Run", icon `Activity` (consistent with command palette and Run tab).
- **Testing:** `href="/testing"`, label "Testing", icon `TestTube2` (consistent with command palette and Dashboard).
- Place after Prompts so Work section order is: Projects, Prompts, Run, Testing.
- No new routes; reuse existing `/run` and `/testing` redirect pages.

## Consequences

- Users can open Run or Testing from the sidebar with one click, consistent with Documentation and Configuration.
- Sidebar navigation aligns with Dashboard and command palette for Run/Testing access.
- Active state for sidebar items works when pathname is `/run` or `/testing` (redirect pages).
