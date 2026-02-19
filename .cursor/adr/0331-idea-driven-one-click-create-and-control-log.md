# ADR 0331: Idea-driven one-click create from description and Control log

## Status

Accepted.

## Context

Users wanted Idea-driven Night shift to support a single flow: click **Idea-driven** and have everything happen on its own — new idea creation, splitting into milestones, splitting into tickets, and executing them — with all steps documented and visible later in **Control**.

## Decision

- **Idea-driven dialog:** When the user clicks **Idea-driven** in the Night shift section, a dialog offers:
  - **Use existing ideas and tickets** — unchanged behavior (start circle with current ideas/tickets).
  - **Create from description** — a textarea for a short idea description and a **Create & run** button.

- **Create & run flow (desktop/Tauri only):**
  1. Create one **idea** via new Tauri command `create_idea` (projectId, title, description, category, source).
  2. Create one **milestone** via new Tauri command `create_project_milestone` (projectId, name, slug, content).
  3. Create one **ticket** via existing `create_plan_ticket` (linked to the new milestone and idea).
  4. Update project’s `ideaIds` via existing `update_project`.
  5. Append an **Idea-driven session** row to the implementation log via `append_implementation_log_entry` with `ticket_number: 0`, `ticket_title: "Idea-driven session: <idea title>"`, and a summary such as "Idea created. 1 milestone. 1 ticket. Circle will run in plan mode."
  6. Start the existing Idea-driven circle (Create → Implement → Test → Debug → Refactor in plan mode) for that single ticket; when the run completes, the normal implementation log entry is appended.

- **Backend:** In `db.rs`, added `create_idea` and `create_milestone`; in `lib.rs`, added Tauri commands `create_idea` and `create_project_milestone` and registered them.

- **Control tab:** Entries with `ticket_number === 0` are treated as **session** entries: rendered with a distinct style (green-tinted), title from `ticket_title` (no "Ticket #0:"), and no Accept/Decline buttons. Run completions continue to create normal implementation log entries (Accept/Decline unchanged).

- **Workflow doc:** `.cursor/workflows/idea-milestones-tickets-run.md` updated with a "One-click Idea-driven (create + run)" section describing the dialog and that everything is visible in Control.

## Consequences

- One click (plus optional description) can create an idea, one milestone, one ticket, and run the full circle, with the session and run results visible in Control.
- Session entries in Control give a clear record of “Idea-driven session: …” and the summary; run entries below (or mixed in by time) show the completed phases.
- Idea-driven remains desktop-only (Tauri); create_idea and create_project_milestone are Tauri commands and use the same SQLite DB as the rest of the app.
