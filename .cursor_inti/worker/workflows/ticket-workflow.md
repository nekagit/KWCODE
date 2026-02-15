# Ticket workflow

## States

1. **Backlog** — In `.cursor/planner/tickets.md`, not done, not in "In progress".
2. **Ready** — In `.cursor/worker/queue/ready.md`; ready to be picked.
3. **In progress** — In `.cursor/worker/queue/in-progress.md`; someone is working on it. Kanban state (`.cursor/planner/kanban-state.json`) may mark ticket ids as in progress for the app's Run tab.
4. **Review** — (Optional) In review before done.
5. **Done** — Checked off in `tickets.md` or listed in `.cursor/worker/queue/completed.md`.

## Relation to app

- **Kanban / Run tab:** The app reads `.cursor/planner/tickets.md` and `.cursor/planner/kanban-state.json`. "In progress" in the UI is driven by `inProgressIds` in `kanban-state.json`.
- **Worker queue files:** `ready.md`, `in-progress.md`, `completed.md` are for humans and scripts. You can keep them in sync with the planner or use them as a separate view; the app does not read them yet.

## Suggested flow

1. Pull from backlog into `ready.md` when the ticket is scoped and dependencies are clear.
2. Move from `ready.md` to `in-progress.md` when starting; update Kanban in the app if you use Implement All.
3. When done, check off in `tickets.md` and optionally append to `completed.md`.
