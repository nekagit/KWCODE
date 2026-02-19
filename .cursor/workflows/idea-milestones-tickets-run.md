# Workflow: Custom idea → milestones → tickets → run

This document describes how to create a custom idea, turn it into milestones and tickets, and run them with **Idea-driven Night shift** (Create → Implement → Test → Debug → Refactor per ticket).

## One-click Idea-driven (create + run) — desktop only

- Open **Project** → **Run** → **Night shift** → click **Idea-driven**.
- In the dialog you can:
  - **Use existing ideas and tickets** — starts the circle with current ideas and tickets (same as before).
  - **Create from description** — enter a short description (e.g. “Add dark mode with system preference detection”). Click **Create & run**.
- When you choose **Create & run**, the app automatically:
  1. Creates a new **idea** (title from first line, description from the rest).
  2. Creates one **milestone** from that title.
  3. Creates one **ticket** linked to the idea and milestone.
  4. Links the idea to the project.
  5. Logs an **Idea-driven session** entry in **Control** (so you can see “Idea created. 1 milestone. 1 ticket.” and the idea title).
  6. Runs the **circle** (Create → Implement → Test → Debug → Refactor) in plan mode for that ticket.
- All of this is **documented in Control**: open **Project** → **Control** to see the session row (green-tinted) and, as runs complete, the implementation log entries for each phase.

## 1. Create a custom idea (manual flow)

**Option A – Ideas page (global ideas)**

- Go to **Ideas** (main Ideas page).
- Create a new idea: title, description, category, source.
- This creates a row in the ideas table. To use it in a project you must **link it to the project** (step 2).

**Option B – Project Ideas doc (repo file)**

- Open your **Project** → **Ideas** doc tab (edits `.cursor/0. ideas/ideas.md` in the repo).
- Use **Add idea (AI-improved)** to append an idea to the doc. This updates the markdown file only; it does **not** create an idea in the ideas table or add it to `project.ideaIds`. For Idea-driven and the project Ideas tab you still need an idea record and linking (below).

**Option C – Create idea linked to project (API)**

- `POST /api/data/ideas` with body: `{ title, description, category, source?, project_id? }`.
- If you set `project_id` to your project ID, the idea is linked for **desktop Idea-driven** (ideas are loaded with `get_ideas_list(projectId)` which uses `idea.project_id`).
- The **Project Ideas tab** shows ideas whose IDs are in `project.ideaIds`. So you also need to add this idea’s ID to the project (step 2) if you want it to appear there and use “Convert to milestones”.

## 2. Link the idea to your project

Two links matter:

- **Project Ideas tab and “Convert to milestones”**  
  The tab shows ideas in `project.ideaIds`. To show your idea there:
  - `PUT /api/data/projects/:projectId` with body `{ ideaIds: [ ...existing, newIdeaId ] }` (or use any UI that updates the project’s idea links).
- **Idea-driven (desktop)**  
  The app loads ideas with `get_ideas_list(projectId)`, which returns ideas where `project_id = projectId` or `project_id IS NULL`. So either:
  - Create the idea with `project_id` set to the project (see Option C above), or
  - Rely on the **fallback**: if no ideas are returned for the project, the app uses `get_ideas_list(null)` and keeps only ideas that have at least one ticket with `idea_id` set. So linking tickets to the idea (step 4) can be enough.

If the project **Ideas** tab is empty, add the idea to the project (e.g. via API or a future “Link idea” UI) so you can use “Convert to milestones” from that tab.

## 3. Convert the idea to milestones

- Open the **Project** → **Ideas** tab.
- Find your idea and click **Convert to milestones**.
- In the dialog, add one or more milestone names (default from the idea title). Submit to create milestones for this project.

## 4. Create tickets and link them to the idea

**From Milestones tab – “Convert to tickets”**

- **Project** → **Milestones** → for a milestone, click **Convert to tickets**.
- Creates tickets with that **milestone** only (no `idea_id`). For **Idea-driven** to pick them up, either:
  - Add tickets from the **Tickets / Planner** tab (step below) with both Milestone and Idea selected, or
  - Ensure there is at least one ticket linked to the idea (e.g. create one from the Tickets tab with Idea set).

**From Tickets / Planner tab (recommended for Idea-driven)**

- **Project** → **Tickets** (or Planner).
- **Add ticket**: choose **Milestone** and **Idea**. This sets `milestone_id` and `idea_id` on the ticket.
- Idea-driven runs the circle for each idea that has tickets; it uses tickets with `idea_id` to decide which ideas to process.

So for a clean Idea-driven run: create tickets from the Tickets tab and always select both a **Milestone** and an **Idea**.

## 5. Run Idea-driven Night shift

- **Project** → **Run** tab → **Night shift** section.
- Click **Idea-driven** (desktop/Tauri only).
- The app will:
  1. Load ideas for the project (or fallback to ideas that have tickets with `idea_id`).
  2. Take the first idea that has at least one ticket linked.
  3. For that idea, run the **circle** (Create → Implement → Test → Debug → Refactor) **per ticket**, one agent run per phase in **plan** mode.
  4. When all tickets for that idea are done, move to the next idea and repeat.
  5. Stop when there are no more ideas or no more tickets.

Status shows the current idea, ticket, and phase. Use **Stop** to clear Idea-driven (and Circle) state.

## Summary

| Step | Where | What |
|------|--------|------|
| 1. Create idea | Ideas page or API (optionally with `project_id`) | New idea record |
| 2. Link to project | `PUT` project with `ideaIds`, or create idea with `project_id` | Idea appears in Project Ideas tab and/or for Idea-driven |
| 3. Convert to milestones | Project → Ideas tab → “Convert to milestones” on the idea | Milestones for the project |
| 4. Create tickets | Project → Milestones (“Convert to tickets”) or **Tickets tab** (“Add ticket” with Milestone + **Idea**) | Tickets with `milestone_id` and `idea_id` for Idea-driven |
| 5. Run | Project → Run → Night shift → **Idea-driven** | Circle per ticket per idea in plan mode |

For the smoothest Idea-driven experience: create the idea, link it to the project (so it appears under Ideas and you can convert to milestones), create milestones, then create tickets from the **Tickets** tab with both **Milestone** and **Idea** selected.
