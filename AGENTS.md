# Agent instructions

Brief guidance for AI agents working in this repo.

## Where things live

- **Decisions and docs**: `nenad/` — all project `.md` (ADRs, PDRs, indexes) go here.
- **Cursor mirror**: `.cursor/adr/` — copy of `nenad/adr/`; keep in sync when adding or changing ADRs.
- **Full index**: **`nenad/ai-project-files.md`** — list of all AI/Cursor-related files (ADR, PDR, .cursor layout).

## Conventions

1. **New ADRs**: Create under `nenad/adr/` (e.g. `nenad/adr/NNN-title-slug.md`), then copy to `.cursor/adr/`. Update `nenad/ai-project-files.md`.
2. **New PDRs**: Create under `nenad/pdr/`. See `nenad/pdr/README.md`.
3. **Don’t delete**: Prefer updating existing files unless the user asks to delete or it’s necessary.
4. **ADR for changes**: Add a new `.md` in `nenad/adr/` for significant changes, following existing ADR format (Status, Context, Decision, Consequences).

## Key paths

- App source: `src/`
- Data (JSON): `data/`
- Tauri backend: `src-tauri/`
- Scripts: `script/`

Use **`nenad/ai-project-files.md`** for the full set of .cursor and AI-related files.
