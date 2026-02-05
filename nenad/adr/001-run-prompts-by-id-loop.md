# ADR 001: Run prompts by ID in a loop across all projects

## Status

Accepted.

## Context

We need to run the same set of prompts (from an export JSON) in every Cursor project repeatedly: open project → open Composer → paste prompt content → execute, then wait and repeat until stopped. The list of prompts should be configurable by **prompt IDs** from `prompts-export.json`, and the script should not require manually copying prompts to the clipboard.

## Decision

- **New script**: `run_prompts_all_projects.sh` (separate from `open_cursor_projects.sh`).
- **Prompt selection**: User supplies a list of prompt IDs (e.g. `8 7 4`). Script loads `prompts-export.json`, looks up each ID, and concatenates the `content` fields in order (with `---` between them). That combined text is copied to the clipboard and pasted once per project per round.
- **Projects**: Reuse the same source as existing automation: `cursor_projects.json` (array of project paths), with the same defaults if the file is missing.
- **Loop**: For each round: set clipboard from combined prompt → for each project open Cursor, open Composer, paste, Enter → sleep 240 seconds → repeat. Process runs until terminated (e.g. Ctrl+C).
- **Clipboard**: Use a temp file for the combined prompt and `pbcopy < file` to avoid huge shell variables and to support large prompt bodies.
- **IDs input**: Support `-p ID [ID ...]` and `-p ID1,ID2,ID3`, and optionally `-f prompt_ids.txt` (one ID per line).

## Consequences

- Single command runs the chosen prompts in all projects on a fixed interval without manual copy/paste.
- Prompt content is defined only in `prompts-export.json`; IDs are stable and easy to share (e.g. in `prompt_ids.txt` or docs).
- Automation is macOS-only (pbcopy + AppleScript). Linux would need another way to set clipboard and focus Cursor.
- Long prompts are handled via temp file and stream into clipboard; no size limit from shell variables.
