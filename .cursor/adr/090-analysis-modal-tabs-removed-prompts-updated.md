# ADR 090: Analysis modal simplified; Feature/Tickets tab links removed; prompts updated

## Status

Accepted.

## Context

The project details Todos tab had "Feature tab" and "Tickets tab" links on the Features and Tickets cards; the Analysis dialog had Close, Copy to clipboard, Save to .cursor, and Run in Cursor buttons. The user requested a simpler flow: remove the tab links from those cards, simplify the Analysis modal (remove close button and copy/Cursor actions from the modal), and ensure both analysis prompts (Features and Tickets) reflect current requirements.

## Decision

1. **Remove Tickets tab and Feature tab links from the cards**
   - On the **Features** card (Todos tab): removed the "Feature tab" button (link to `/?tab=feature`). Only the **Analysis** button remains.
   - On the **Tickets** card (Todos tab): removed the "Tickets tab" button (link to `/?tab=tickets`). Only the **Analysis** button remains.

2. **Analysis modal**
   - Removed from the modal footer: **Close** button, **Save prompt to .cursor** button, **Run in Cursor** button, and **Copy to clipboard** button. The modal no longer has any action buttons.
   - Dialog still closes via clicking outside or pressing Escape (default Radix behavior). Description text updated to: "Run this prompt in Cursor in this project's repo. … Close with Escape or click outside."

3. **Prompts updated with new requirements**
   - **Tickets analysis** (\`buildTicketsAnalysisPrompt\`): Added requirement that the project details page parses these files for Kanban and JSON; reference \`.cursor/tickets-format.md\`, \`.cursor/features-tickets-correlation.md\`, and \`.cursor/sync.md\`. Specified required sections (Title, Metadata, Summary, Prioritized work items with P0–P3 and \`#### Feature:\`, Next steps) and that format must be followed exactly for parsing.
   - **Features analysis** (\`buildFeaturesAnalysisPrompt\`): Added requirement that the project details page parses \`.cursor/features.md\` for Kanban and JSON; reference \`.cursor/sync.md\`. Stated that every feature line must include ticket refs (e.g. \`— #1, #2\`) so the Kanban/JSON view parses correctly.

## Consequences

- Features and Tickets cards are focused on Analysis only; navigation to the global Feature/Tickets tabs is still available elsewhere (e.g. sidebar, Run page).
- Analysis modal is prompt-only; users copy/run the prompt via Cursor manually (Escape or outside click to close).
- Both prompts now explicitly require format compliance for Kanban/JSON parsing and reference sync and correlation docs.
