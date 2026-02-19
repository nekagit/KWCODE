# ADR 0330: Workflow documentation — custom idea, milestones, tickets, run

## Status

Accepted.

## Context

Users need a single place that explains how to create a custom idea, turn it into milestones and tickets, and run them with Idea-driven Night shift. The flow spans Ideas (page and project tab), project linking (`ideaIds` / `project_id`), Milestones tab (Convert to milestones), Tickets/Planner (Add ticket with Milestone + Idea), and Run tab (Idea-driven). No consolidated workflow doc existed.

## Decision

- Add a **workflow document** at `.cursor/workflows/idea-milestones-tickets-run.md` that describes:
  1. **Create a custom idea** — Ideas page, Project Ideas doc, or API (with optional `project_id`).
  2. **Link the idea to the project** — `project.ideaIds` for the Project Ideas tab and “Convert to milestones”; `idea.project_id` or ticket-based fallback for desktop Idea-driven.
  3. **Convert the idea to milestones** — Project → Ideas tab → “Convert to milestones” on the idea.
  4. **Create tickets and link to the idea** — Milestones “Convert to tickets” (milestone only) vs Tickets tab “Add ticket” with Milestone + Idea (needed for Idea-driven).
  5. **Run Idea-driven Night shift** — Project → Run → Idea-driven; circle per ticket per idea in plan mode.

- The doc clarifies that for Idea-driven, tickets must have `idea_id` set (e.g. by adding tickets from the Tickets tab with Idea selected). It also explains the two linking mechanisms (project.ideaIds vs idea.project_id / fallback).

## Consequences

- Users have one reference for the full flow: custom idea → milestones → tickets → run.
- Reduces confusion about where to create ideas, how to link them, and why “Add ticket” with Idea is important for Idea-driven.
- Future UI (e.g. “Link idea to project”) can be documented in the same workflow.
