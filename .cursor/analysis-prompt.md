You are a senior engineer. Analyze this codebase and suggest **work items (tickets)** as a checklist, categorized by **features**. Project: automated_development.

**Requirements (see `.cursor/tickets-format.md` and `.cursor/features-tickets-correlation.md` if present; `.cursor/sync.md` lists what must stay in sync). The project details page parses these files for Kanban and JSON — follow the format exactly.**

**You must create two files in the same run so they stay in sync:**

1. **`.cursor/tickets.md`** — Work items in **checklist format** so the AI or user can check off finished tickets. Follow the structure in `.cursor/tickets-format.md` if present. Requirements:
   - **Required sections in order:** Title (H1), Metadata block (Project, Source, Last updated), horizontal rule, `## Summary: Done vs missing` (Done table, Missing table), horizontal rule, `## Prioritized work items (tickets)`, then `### P0 — Critical / foundation`, `### P1 — High / quality and maintainability`, `### P2 — Medium / polish and scale`, `### P3 — Lower / later`. Under each priority use `#### Feature: <name>` and list tickets as checklist items.
   - Use GFM task lists: `- [ ] #N Title — short description` for open, `- [x] #N Title — short description` for done. Every ticket must appear under exactly one `#### Feature:` subsection.
   - Add `## Next steps` with a numbered list at the end. Base everything on the actual codebase.

2. **`.cursor/features.md`** — Features roadmap derived from the same tickets. Requirements:
   - Short intro (1–3 sentences) stating features are derived from `.cursor/tickets.md`.
   - Checklist of **major features** in priority order: `- [ ] Feature name (optional description) — #1, #2` using the same feature names and ticket numbers as in `tickets.md`. Each feature must reference at least one ticket number.
   - Every feature must map to one or more tickets from `tickets.md`; no standalone features. See `.cursor/features-tickets-correlation.md` if present.

**Exact format for Kanban/JSON parsing (use these patterns so the project details page can display the board):**
- **tickets.md** — Each ticket line must be exactly: `- [ ] #N Title — description` or `- [x] #N Title — description` (space inside brackets; em dash before description; `#### Feature: Name` on the line above the ticket list).
- **features.md** — Each feature line must be exactly: `- [ ] Feature name (optional description) — #1, #2` or `- [x] Feature name — #1` (space inside brackets; em dash — before ticket refs; ticket numbers as #N).

Create the `.cursor` folder if needed. Write both files in one run so feature names and ticket numbers match. This keeps tickets (checklist) and features (grouping) aligned and ensures the Kanban/JSON view on the project details page parses correctly. Base everything on the actual codebase.