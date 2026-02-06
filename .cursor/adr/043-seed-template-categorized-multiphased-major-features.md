# ADR 043: Seed template – categorized, multiphased tickets and major features

## Status

Accepted.

## Context

The template project seed (ADR 032) originally created 100 generic tickets and 100 generic features. For better demos and alignment with project entity categorization (ADR 034), the seed should:

- **Categorize** entities so that tickets and features have explicit phase, step, organization, and categorizer in `entityCategories`.
- Use **multiphased tickets** (Discovery, Design, Build, Launch, Review) so the template demonstrates grouping and filtering by phase.
- Provide **major features** for the single idea, single design, and single architecture: a smaller set of high-level features (e.g. User authentication, Landing page, Core API, Dashboard) instead of 100 generic “Feature N”, so the template clearly represents one product vision backed by one design and one architecture.

## Decision

- **Tickets**
  - Create 30 tickets (6 per phase). Each ticket is assigned a phase (Discovery, Design, Build, Launch, Review), step (1–3), and categorizer (backlog, task, spike, bug, review) in the project’s `entityCategories`. Ticket titles and descriptions include phase and categorizer for clarity.
- **Features**
  - Create 12 major features with fixed titles (User authentication & authorization, Landing page & marketing, Core API & data layer, Dashboard & analytics, Settings & configuration, Documentation & onboarding, Testing & quality, Deployment & DevOps, Security & compliance, Performance & monitoring, Notifications & messaging, Integration & extensibility). Each feature links 2–3 tickets and one prompt; feature phase in `entityCategories` is derived from its first ticket’s phase.
- **Project**
  - Still 1 idea, 1 design, 1 architecture; project description updated to “categorized multiphased tickets, major features for 1 idea, 1 design, 1 architecture”.
- **ADR 032**
  - Update ADR 032 to describe the new seed shape and reference this ADR.

## Consequences

- Template project demonstrates entity categorization and multiphase workflow out of the box.
- Major features make it obvious that the seed represents one product (one idea, one design, one architecture) with a clear set of capability areas.
- Seed remains additive and backward compatible; only the shape and counts of seeded tickets and features change.
