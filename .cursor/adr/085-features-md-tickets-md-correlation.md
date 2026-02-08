# ADR 085: features.md and tickets.md correlation

## Status

Accepted.

## Context

The project uses `.cursor/tickets.md` for work items (tickets) and `.cursor/features.md` for the features roadmap. These were generated independently, so features and tickets could drift: features could mention work that had no ticket, or tickets could have no corresponding feature.

## Decision

- **Correlation rule:** Features in `.cursor/features.md` must **consist of** work items from `.cursor/tickets.md`. Each feature is a grouping of one or more tickets; no feature without corresponding tickets.
- **Documentation:** Add `.cursor/features-tickets-correlation.md` describing the rule, format hints (e.g. reference ticket numbers in feature lines), and workflow (tickets as source of truth; derive features from tickets).
- **Analysis prompt:** Update `buildFeaturesAnalysisPrompt` in `src/lib/analysis-prompt.ts` to:
  - Accept an optional `ticketsMdContent` (content of `.cursor/tickets.md`). When provided, the prompt includes that content and instructs the AI to derive features from it (each feature = one or more tickets; reference ticket #s).
  - When `ticketsMdContent` is not provided, instruct the AI to read `.cursor/tickets.md` if present and base features on it; if missing, create a features list that can later be reflected in tickets.
- **Project details UI:** When opening the Features analysis dialog, pass the already-loaded `cursorTicketsMd` (from the Todos tab) into `buildFeaturesAnalysisPrompt` so the generated prompt contains the current tickets and the AI produces features that map to them.
- **Full analysis prompt:** Update the main `ANALYSIS_PROMPT` bullet for `features.md` to state that it must align with `tickets.md` and reference the correlation doc.

## Consequences

- Features and tickets stay traceable: every feature maps to tickets; no orphan features.
- Re-running Features analysis with tickets.md loaded produces a features.md that references the same work items.
- New projects should maintain tickets.md first, then features.md derived from it. The correlation doc and prompts encode this workflow.
