# ADR 044: Tickets tab pagination and total count

## Status

Accepted.

## Context

The Tickets tab on the dashboard (/?tab=tickets) displays all tickets in a single scrollable list with a fixed-height ScrollArea. With many tickets (e.g. hundreds from seed or generated projects), users reported they could not see all created tickets: the list was long, scroll was easy to miss, and there was no indication of total count or way to jump to a range.

## Decision

- **Pagination**
  - Show 50 tickets per page on the Tickets tab. Add Previous / Next controls and a label "Page X of Y (N total)" when there are more than 50 tickets.
- **Total count**
  - Show "N tickets total" in the CardDescription so users know how many tickets exist.
- **ScrollArea height**
  - Increase the list ScrollArea from 280px to 420px so more tickets are visible per page.
- **Page clamping**
  - When the ticket list shrinks (e.g. after deletions), clamp the current page so it stays in valid range (e.g. reset to last valid page if current page would be empty).

## Consequences

- All created tickets remain accessible via pagination; no tickets are hidden.
- Total count and page indicator make it clear how many tickets exist and where the user is in the list.
- Slightly larger list area improves scanability; 50 items per page keeps DOM and scroll manageable.
