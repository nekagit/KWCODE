# ADR: Planner Manager – AI-generated ticket from prompt, add to backlog at top

## Date
2026-02-12

## Status
Accepted

## Context
The user wanted the Planner Manager section to stop offering direct "Add ticket" and "Add feature" buttons. Instead, they wanted: (1) two clickable badges (Ticket | Feature) to choose mode; (2) an input and a text area for a free-form prompt (e.g. "I want a new page with settings"); (3) keyboard-tabbable flow from badge → input → magic-stick AI button; (4) AI to generate a ticket based on presettings for how tickets and ticket prompts should be stored and built; (5) on confirm, add the generated ticket to the **top of the backlog**.

## Decision
- **Planner Manager content** no longer includes Add Ticket or Add Feature buttons. It now has:
  - **Mode badges:** "Ticket" and "Feature" (toggle one on). Only "Ticket" is implemented; "Feature" shows a "coming soon" message.
  - **Ticket mode:** An **input** (short summary) and a **textarea** (details). User can type e.g. "I want a new page with settings" and tab through: badge → input → textarea → **Generate ticket** button (magic-stick icon).
  - **AI generation:** On "Generate ticket", the app calls **POST /api/generate-ticket-from-prompt** with `{ prompt, existingFeatures }`. The API uses OpenAI (gpt-4o-mini) with a system prompt that follows `.cursor/tickets-format.md`: output a single JSON with `title`, optional `description`, `priority` (P0–P3), and `featureName`. Existing feature names from the Kanban are sent so the model can reuse one if it fits.
  - **Confirm step:** The generated ticket is shown inline (title, description, priority, feature). User can **Confirm & add to backlog** or **Cancel**.
  - **Add to backlog at top:** On confirm, a new ticket is created with the next ticket number, **prepended** to the current tickets list (`[newTicket, ...kanbanData.tickets]`), then `tickets.md` and `features.md` are serialized and written. Backlog column order follows ticket array order, so the new ticket appears at the top of the backlog.
- **Bulk Actions** (Remove all tickets / Remove all features) remain in Planner Manager, below the prompt/confirm block.
- **Add Ticket / Add Feature dialogs** are still available elsewhere (e.g. empty state "Add ticket") for manual add; they are only removed from the Planner Manager accordion.

## Consequences
- Users can describe work in natural language and get a properly formatted ticket (title, description, priority, feature) without filling a form.
- Ticket and prompt storage format is enforced by the API system prompt and by existing serialization (`.cursor/planner/tickets.md` and `.cursor/planner/features.md`).
- New tickets from this flow always appear at the top of the backlog. Feature mode can be added later with a similar AI flow for features.
