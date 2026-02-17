# ADR 0065: Worker tab — Command Center inside Terminal Output section

## Status
Accepted (2025-02-17)

## Context
The Worker tab had a separate "Command Center" card (Implement All, Stop all, Clear, Archive) above the "Terminal Output" section. The user wanted the Command Center and Terminal Output in one section.

## Decision
- Move the Command Center UI and logic into `WorkerTerminalsSection`.
- The Terminal Output card now contains: (1) section header "Terminal Output", (2) Command Center row (Implement All, Stop all, Clear, Archive), (3) terminal slots grid. All in a single card.
- Remove the standalone `WorkerCommandCenter` component and its invocation from the tab.
- Description updated to: "Command Center and terminals — each slot shows the ticket below."

## Consequences
- One combined section for running Implement All and viewing terminal output; fewer separate cards and a clearer flow.
