# ADR 120: Features & Tickets card — title row buttons and MD side-by-side view

## Status
Accepted

## Context
The Todos tab "Features & Tickets" card had all actions (Analysis, Archive) inside the accordion content, making the card feel crowded. Users wanted:
- Actions in the title row (like the Kanban card per ADR 115): MD, Analysis buttons, and Archive
- An **MD** action that opens a side-by-side view of `.cursor/features.md` and `.cursor/tickets.md`
- Less crowded content: shorter previews and tighter spacing

## Decision

1. **Title row layout**
   - Use the same pattern as the Kanban card: `AccordionTrigger` contains a flex row with title on the left and a button group on the right.
   - `onClick={(e) => e.stopPropagation()}` on the button wrapper so clicking buttons does not toggle the accordion.

2. **Buttons in title row (left to right)**
   - **MD** — Opens a dialog with side-by-side rendered markdown for `features.md` and `tickets.md`. Tooltip: "Open side-by-side view of .cursor/features.md and .cursor/tickets.md".
   - **Analysis (tickets & features)** — Same as before: opens analysis dialog for both files.
   - **Analysis: Features** — Same as before: populates features from tickets (disabled when no tickets.md). Label shortened from "Analysis: Features (from tickets)".
   - **Archive** — Same as before (Tauri + repo path). Label shortened from "Archive both".

3. **MD view dialog**
   - New state: `featuresTicketsMdViewOpen`.
   - Dialog: title "features.md & tickets.md — side by side", two-column grid on `md` breakpoint.
   - Each column: label (`.cursor/features.md` / `.cursor/tickets.md`), then `ScrollArea` with rendered markdown via `ReactMarkdown` + `remarkGfm`. Uses same loading/error/empty handling as the card previews.
   - Dialog max width `max-w-5xl`, max height `90vh`, so the side-by-side view is usable without scrolling the page.

4. **Card content — less crowded**
   - Intro line shortened; mention "Use **MD** for side-by-side view".
   - Inline .md preview heights reduced from 240px to 160px; padding from `p-3` to `p-2.5`; section margins from `mb-4` to `mb-3`, `gap-4` to `gap-3`, `mb-2` to `mb-1.5` where appropriate.
   - Analysis and Archive buttons removed from the content (they live only in the title row).

## Consequences
- Users can open a dedicated, side-by-side markdown view without expanding the card or scrolling past previews.
- The card header is more actionable and consistent with the Kanban card; the content area is less dense.
- MD view uses the same data as the card (cursorFeaturesMd, cursorTicketsMd); Sync in the Kanban card still refreshes both.
