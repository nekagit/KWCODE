# ADR 0012: Ideas & Innovation Roadmap (ideas.md)

## Status

Accepted

## Context

The project needs a single, living document that captures product vision, near- and long-term ideas, technical R&D, UX innovations, competitive positioning, and prioritization. Without it, innovation is ad hoc and alignment on “what to build next” is harder. Best practice for AI-assisted and product-led projects is to maintain an ideas/roadmap document that guides both humans and AI (e.g. Cursor agents) when planning features and backlogs.

## Decision

- **Use `.cursor/setup/ideas.md`** as the canonical **Ideas & Innovation Roadmap** for run-prompts.
- **Content includes:** Project context & current state (repo layout, tech stack, package name, scope); vision statement and key differentiators; Tier 1 (1–3 months), Tier 2 (3–6 months), and Tier 3 (6–12 months) ideas with Problem, Solution, AI Integration, User Flow, Technical Approach, Dependencies, Effort, Impact, Success Metrics; Technical R&D explorations; UX innovation ideas (including Command Palette ⌘K as Tier 1 #4); competitive analysis matrix; prioritization framework and ranked backlog (top 15); idea lifecycle; user feedback integration; innovation experiments; risks & mitigation; and an appendix idea template.
- **Updates:** The document is updated when priorities shift, new opportunities emerge, or when prompted (e.g. PROMPT 03: GENERATE IDEAS.MD). All new idea proposals that are novel and aligned should be added using the appendix template and scored with the prioritization framework.

## Consequences

- Product and engineering have one place to see vision, backlog, and rationale.
- AI agents and Cursor workflows can reference ideas.md for context when implementing or planning.
- Command Palette (⌘K) and other high-impact ideas (e.g. prompt chaining, Git integration, OAuth) are explicitly prioritized as P0/P1.
- Prioritization and lifecycle stages reduce scope creep and clarify when to archive ideas.

## References

- Roadmap source: `.cursor/setup/ideas.md`
- Prompt used to generate/refresh: PROMPT 03 (GENERATE IDEAS.MD)
- Related: `.cursor/project/ROADMAP.md` (high-level phases); `.cursor/7. planner/tickets.md` (implementation work)
