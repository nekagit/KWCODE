# ADR 005: Sidebar order — Dashboard, Prompts, Projects, Tickets, Feature

## Status

Accepted.

## Context

The sidebar tab order was: Dashboard, Tickets, Feature, Projects, Prompts. Users wanted a flow that puts configuration (Prompts, Projects) before work items (Tickets, Feature).

## Decision

- **Sidebar order**: Dashboard → Prompts & timing → Projects → Tickets → Feature → AI Generate → Log.
- Subtitle under "Run Prompts Control" updated to: "Dashboard · Prompts · Projects · Tickets · Feature · Log".

## Consequences

- Prompts and Projects sit directly under Dashboard for quick access to run configuration.
- Tickets and Feature follow as the main work-item tabs.
- No change to tab values or routing; only visual order in the sidebar.
