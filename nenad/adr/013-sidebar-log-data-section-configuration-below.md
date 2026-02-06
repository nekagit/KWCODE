# ADR 013: Sidebar – Log & Data section, Configuration below

## Status

Accepted.

## Context

The left sidebar listed all items in a single flat list: Dashboard, Projects, Tickets, Feature, Data, Log, Prompts, AI Generate, Configuration. Log and Data are secondary/support views; Configuration is app settings. Grouping them improves scanability and keeps primary workflow items at the top.

## Decision

- **Main nav** (top): Dashboard, Projects, Tickets, Feature, Prompts, AI Generate.
- **Log & Data** (separate section): Data, Log — with a section label “Log & Data” and a visual divider above.
- **Settings** (bottom): Configuration — in a “Settings” section at the bottom of the sidebar with a divider above.

Implementation: split `navItems` in `app-shell.tsx` into `mainNavItems`, `logDataNavItems`, and `configNavItems`; render with section headers and borders; use `mt-auto` on the Settings block so it stays at the bottom.

## Consequences

- Sidebar has three clear groups; Log/Data and Configuration are easier to find.
- Header subtitle no longer lists Data · Log (main items only).
- No route or behavior changes; only sidebar structure and labels.
