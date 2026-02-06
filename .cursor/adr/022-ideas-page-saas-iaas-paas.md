# ADR 022: Ideas page — SaaS, IaaS, PaaS, website, webapp, webshop

## Status

Accepted.

## Context

Users need a place to capture and organise business ideas for internet and computer-related products: SaaS, IaaS, PaaS, websites, webapps, webshops, and similar. They want both ready-made template ideas and the ability to generate ideas with AI or write their own.

## Decision

- **Ideas page** at `/ideas` with three sections (tabs):
  1. **Templates** — A fixed list of ~15 pre-written ideas across categories (SaaS, IaaS, PaaS, website, webapp, webshop). Each has “Add to my ideas” to copy into the user’s list.
  2. **AI generated** — Input a topic/niche; call `/api/generate-ideas` (OpenAI) to return up to 5 ideas; user can add any to “My ideas”.
  3. **My ideas** — Persisted list in `data/ideas.json` via `/api/data/ideas` (GET/POST). Users can add new ideas manually (dialog form with title, description, category), edit existing ones, and see source (template | ai | manual).

- **Data model**: Each idea has `id`, `title`, `description`, `category` (saas | iaas | paas | website | webapp | webshop | other), `source` (template | ai | manual), and timestamps.

- **Navigation**: “Ideas” link with Lightbulb icon added to the main sidebar (between Prompts and AI Generate).

## Consequences

- Single place for digital business ideas with templates, AI, and manual entry.
- Ideas are stored in JSON; no new DB. Same file-based pattern as prompts.
- OPENAI_API_KEY required for AI generation; templates and manual ideas work without it.
