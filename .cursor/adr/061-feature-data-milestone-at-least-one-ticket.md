# ADR 061: Feature data – milestones with at least one ticket

## Status

Accepted.

## Context

Features were modeled with optional tickets and required prompts. The product meaning of a feature should be: a **milestone** that has to be done in an application. One feature can have many tickets and must have at least one ticket.

## Decision

- **Feature = milestone**: A feature is a milestone that has to be done in an application. One feature has many tickets and **must have at least one ticket**.
- **Data model**: Keep `Feature.ticket_ids` as the source of truth; require `ticket_ids.length >= 1` when creating or updating a feature.
- **Validation**:
  - Add feature: require at least one ticket selected; show error "A feature is a milestone and must have at least one ticket" if none.
  - Update feature: reject updates that would set `ticket_ids` to an empty array.
- **UI**: Change label from "Tickets (optional)" to "Tickets (required, at least one)" on the Add feature form.
- **Types and comments**: Add JSDoc / doc comments to `Feature` (page.tsx), `FeatureRecord` (seed-template), `Feature` (Tauri lib.rs), and `FeatureQueueItem` (run.ts) stating that a feature is a milestone with at least one ticket.
- **Seed template**: Ensure each seeded feature gets at least one ticket (already the case); make `FeatureRecord.ticket_ids` required (no optional `?`); add guard so we never push a feature with empty `ticket_ids`.

## Consequences

- Features are clearly defined as milestones with a minimum of one ticket.
- Existing features with zero tickets (if any) remain displayable; new/updated features cannot have zero tickets.
- Run queue and prompts remain unchanged; a feature can still have prompts and project_paths for execution.
