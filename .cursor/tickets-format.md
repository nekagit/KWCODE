# Standard format for `.cursor/tickets.md`

This document defines the canonical structure for `.cursor/tickets.md` so contents are consistent and can be displayed in the project details page (Todos tab → Tickets card). Tickets use a **checklist format** so the AI (or user) can check off finished items. Every ticket must be **categorized under a feature**; when creating `tickets.md`, also create `.cursor/features.md` so both stay in sync (see `.cursor/features-tickets-correlation.md`).

## Required structure

Use the following sections in order. Keep section headings exactly as shown so parsing and display stay consistent.

1. **Title (H1)**  
   `# Work items (tickets) — {project_name}`  
   Use the project or repo name.

2. **Metadata block**  
   - `**Project:**` project name  
   - `**Source:**` short note (e.g. "Codebase analysis", "Manual")  
   - `**Last updated:**` date or "From current repo state"

3. **Horizontal rule**  
   `---`

4. **Summary: Done vs missing**  
   - `## Summary: Done vs missing`  
   - `### Done`  
   - Table: `| Area | What's implemented |` (optional description column)  
   - `### Missing or incomplete`  
   - Table: `| Area | Gap |`

5. **Horizontal rule**  
   `---`

6. **Prioritized work items (tickets) — checklist by feature**  
   - `## Prioritized work items (tickets)`  
   - **Every ticket must belong to a feature.** Use priority blocks, then under each priority group tickets by feature:
     - `### P0 — Critical / foundation`  
       - `#### Feature: <feature_name>`  
         - Checklist items: `- [ ] #N Title — short description` for open, `- [x] #N Title — short description` for done.  
     - `### P1 — High / quality and maintainability`  
       - Same: `#### Feature: <name>` then checklist.  
     - `### P2 — Medium / polish and scale`  
     - `### P3 — Lower / later`  
   - **Checklist format:** Use GFM task list so items can be checked off when done:
     - Open: `- [ ] #1 Set up auth — Add login and session handling`
     - Done: `- [x] #2 Add README — Basic project overview`
   - When generating `tickets.md`, also create `.cursor/features.md` with the same feature names and ticket references (e.g. `- [ ] Feature name — #1, #2`) so both files stay in sync.

7. **Next steps**  
   - `## Next steps`  
   - Numbered list (1. 2. 3.) with short-term and backlog items.

8. **Footer**  
   - Optional: `*Based on codebase as of analysis. Update this file as work is completed or priorities change. Check off items with \`[x]\` when done.*`

## Feature categorization

- Each ticket must appear under exactly one **Feature** subsection (e.g. `#### Feature: Authentication`, `#### Feature: Dashboard`).
- The same feature names and ticket numbers must appear in `.cursor/features.md` so that features are a grouping of tickets and both files stay aligned.

## Display

- The project details page (Todos tab → Tickets card) loads `.cursor/tickets.md` from the project repo when the file exists.
- Content is rendered as markdown with GFM (checklists render as task lists). If the file is missing or unreadable, the card shows a short message instead of the content.

## Location

- File path: `.cursor/tickets.md` at the project repository root.
- When generating or updating this file (e.g. from analysis), create both `.cursor/tickets.md` and `.cursor/features.md` in the same run and keep them in sync with this format.
