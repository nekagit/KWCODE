# ADR 111: Sync validation and Analysis: Features from tickets

## Status
Accepted

## Context
- Tickets #1–#4 required: (1) populate tickets.md from codebase, (2) populate features.md from tickets.md, (3) Sync button validates features.md and tickets.md correlation, (4) Analysis: Tickets creates both files in one run.
- The project already had buildTicketsAnalysisPrompt (creates both) and buildFeaturesAnalysisPrompt (derives from tickets). Sync had inline correlation checks; we wanted a reusable validator aligned with .cursor/sync.md.

## Decision

1. **validateFeaturesTicketsCorrelation in todos-kanban.ts**
   - New export `validateFeaturesTicketsCorrelation(featuresMd, ticketsMd)` returns `{ ok, message, details }`.
   - Errors (cause ok=false): ticket refs in features that don't exist in tickets; features without ticket refs; feature names in tickets without matching feature in features.
   - Info (details but ok=true): tickets not referenced in any feature (acceptable backlog state).

2. **Sync uses the validator**
   - runSync now calls validateFeaturesTicketsCorrelation for correlation validation instead of inline logic.
   - Keeps existing behavior: marks tickets done from done features, writes todos-kanban.json (Tauri).

3. **Analysis: Features (from tickets) button**
   - Added "Analysis: Features (from tickets)" on the Features & Tickets card.
   - Opens buildFeaturesAnalysisPrompt with cursorTicketsMd so features.md is populated from existing tickets.md.
   - Disabled when tickets.md is not loaded.

4. **Analysis: Tickets already creates both**
   - buildTicketsAnalysisPrompt instructs the AI to create both tickets.md and features.md in one run. No change needed.

## Consequences
- Sync validation is consistent with .cursor/sync.md and reusable.
- Users can regenerate features.md from tickets.md without re-running full analysis.
- Tickets #1–#4 are implemented.