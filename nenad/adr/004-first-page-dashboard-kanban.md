# ADR 004: First page as Dashboard with quick actions and ticket kanban

## Status

Accepted.

## Context

The app had Tickets as the first tab with a form and a flat list. Users need an overview and fast access to common actions plus a visual board for ticket status.

## Decision

- **Default first tab is Dashboard** (new tab), not Tickets.
- **Quick actions** on the dashboard: Add ticket, Run first feature, Features, AI Generate tickets, View log.
- **Ticket kanban board** on the dashboard: four columns (Backlog, In progress, Done, Blocked) with drag-and-drop to change ticket status. Cards show title, description snippet, priority, and delete.
- Tickets tab remains for full add/edit form and list; Dashboard is the landing overview.

## Consequences

- Users see quick actions and kanban first; deeper flows (add ticket, features, log) are one click away.
- Kanban uses HTML5 drag-and-drop; no new dependency. Status is persisted via existing `updateTicket(id, { status })`.
- Sidebar label updated to include "Dashboard" in the list.

## References

- Best practice for AI-assisted dev tools: surface primary workflow (tickets + run) on the home view; keep secondary flows in tabs.
