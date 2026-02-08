# ADR 086: Tickets checklist format, feature categorization, and joint creation of tickets.md + features.md

## Status

Accepted.

## Context

Work items were tracked in `.cursor/tickets.md` and features in `.cursor/features.md` (see ADR 085). We wanted: (1) a **checklist-style** `tickets.md` so the AI can check off finished tickets; (2) **every ticket categorized to a feature**; (3) **creating `tickets.md` to also create `features.md`** and keep both in sync in one run.

## Decision

- **Checklist format for tickets:** `.cursor/tickets.md` uses GFM task lists: `- [ ] #N Title — description` for open, `- [x] #N Title — description` for done. This allows the AI or user to mark items complete without changing structure. See `.cursor/tickets-format.md`.
- **Feature categorization:** Every ticket must appear under a feature. Structure: under each priority (P0–P1–P2–P3), use `#### Feature: <name>` and list tickets as checklist items under that feature. No ticket without a feature.
- **Joint creation:** The **Tickets** analysis prompt (`buildTicketsAnalysisPrompt` in `src/lib/analysis-prompt.ts`) instructs the AI to create **both** `.cursor/tickets.md` and `.cursor/features.md` in the same run, using the same feature names and ticket numbers so both files stay aligned.
- **Format doc:** `.cursor/tickets-format.md` was updated to describe the checklist format, feature subsections, and the requirement to create `features.md` when generating `tickets.md`.
- **Correlation doc:** `.cursor/features-tickets-correlation.md` was updated to describe the checklist, feature categorization, and the “Tickets analysis creates both files” workflow.
- **Project details UI:** The Tickets card label and Analysis button tooltip were updated to state that analysis produces a checklist by feature and creates both files.

## Consequences

- AI and users can check off finished tickets in `tickets.md`; checklist rendering is supported (e.g. GFM in the project details page).
- Features and tickets stay traceable: every ticket belongs to a feature; one analysis run produces both files with matching names and numbers.
- Single “Analysis” run from the Tickets card generates both `.cursor/tickets.md` and `.cursor/features.md`, reducing drift and keeping the roadmap and backlog aligned.
