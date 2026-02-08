# Correlation: `.cursor/features.md` and `.cursor/tickets.md`

This document defines how **features** and **tickets** stay aligned in this project.

## Rule

**Features in `.cursor/features.md` must consist of work items (tickets) from `.cursor/tickets.md`.**

- Each **feature** is a higher-level goal or theme that groups one or more **tickets**.
- Every feature listed in `features.md` should map to at least one ticket (by number or title) from `tickets.md`.
- Do not add features in `features.md` that have no corresponding tickets; instead, add the work items to `tickets.md` first, then add or update the feature.

## Formats

- **tickets.md**: See `.cursor/tickets-format.md` for the required structure. Tickets use a **checklist format** (`- [ ]` / `- [x]`) so the AI or user can check off finished items. Every ticket is **categorized under a feature** (e.g. `#### Feature: Auth`); priorities P0–P3 contain feature subsections with checklist items.
- **features.md**: Use a short intro plus a checklist of major features. Each feature line should reference the related ticket number(s), e.g. `- [ ] Feature name — #1, #2`, using the same feature names and ticket numbers as in `tickets.md`.

## Creating both files (Tickets analysis)

When you run **Analysis: Tickets** from the project details page (Tickets card), the prompt instructs the AI to create **both** `.cursor/tickets.md` and `.cursor/features.md` in one run. That way:

- Ticket checklist and feature groupings stay in sync.
- Same feature names and ticket numbers appear in both files.
- The AI can check off finished tickets in `tickets.md` and keep `features.md` aligned when updating.

## Workflow

1. Keep `.cursor/tickets.md` as the source of truth for concrete work items (tasks, bugs, improvements). Use checklist format and categorize each ticket under a feature.
2. When creating or updating `.cursor/features.md`, derive features from those tickets: group related tickets into a feature, and list features in priority order with ticket refs. Prefer running Tickets analysis once to generate both files.
3. When adding a new feature idea, first add the underlying tickets to `tickets.md`, then add or update the feature in `features.md` to reference them.

## Why

- Prevents features and tickets from drifting apart.
- Ensures the roadmap (features) and the backlog (tickets) stay traceable.
- Checklist format lets the AI mark tickets done and keeps both files easy to maintain.
