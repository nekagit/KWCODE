# Run Prompts All Projects Script

## Purpose

`run_prompts_all_projects.sh` opens each Cursor project from `cursor_projects.json`, opens the Composer (Agent) panel, pastes the **combined content** of selected prompts from `prompts-export.json`, and presses Enter. It then waits 240 seconds and repeats until you stop it (Ctrl+C).

## Usage

```bash
# With prompt IDs on the command line (space- or comma-separated)
./run_prompts_all_projects.sh -p 8 7 4
./run_prompts_all_projects.sh -p 8,7,4

# With a list of IDs in a file (one ID per line)
./run_prompts_all_projects.sh -f prompt_ids.txt

# Optional: use a different projects JSON
./run_prompts_all_projects.sh -p 8 7 4 /path/to/projects.json
```

## Prompt IDs (from prompts-export.json)

| ID | Title |
|----|--------|
| 8 | Major Feature Prompt |
| 7 | Cursorrules and Cursor folder |
| 6 | Deploy |
| 5 | Scan for Malicious Activity |
| 4 | Implement further based on .cursorrules |
| 3 | Run 3002 |
| 2 | Run 3001 |
| 1 | Run 3000 |

## Behaviour

1. **One round**: For each project path in `cursor_projects.json`, the script:
   - Opens Cursor with that project folder
   - Brings Cursor to front, opens Composer (Cmd+I)
   - Pastes the combined prompt (Cmd+V) and presses Enter
2. **Wait**: Sleeps 240 seconds (`SLEEP_BETWEEN_ROUNDS`, override with env var).
3. **Repeat**: Goes back to step 1 until you terminate the process (Ctrl+C).

Combined prompt = content of prompt ID 1, then `---`, then content of ID 2, etc., in the order you give the IDs.

## Environment variables

- `SLEEP_BETWEEN_ROUNDS` – seconds between rounds (default: 240)
- `SLEEP_AFTER_OPEN_PROJECT` – seconds to wait after opening each project before paste/Enter (default: 2.5); increase if the 4th (or later) project doesn’t get focus
- `SLEEP_BETWEEN_PROJECTS` – seconds between moving to the next project (default: 2.0)
- `SLEEP_BETWEEN_TOGGLE` – seconds between the two Cmd+I (close then reopen Composer); increase if panel doesn’t reopen (default: 2.0)
- `SLEEP_AFTER_OPEN`, `SLEEP_AFTER_PANEL`, `SLEEP_AFTER_PASTE`, `SLEEP_AFTER_ENTER` – timing for UI automation
- `AGENT_PANEL_DOUBLE_I` – script always sends Cmd+I twice so Composer ends open (close then open when it was open).

## Requirements

- macOS (uses `pbcopy` and AppleScript for Cursor/System Events)
- `jq` or Python 3 (for reading `prompts-export.json`)
- Cursor installed (`cursor` in PATH or `open -a Cursor`)

## Files

- `run_prompts_all_projects.sh` – main script
- `prompts-export.json` – prompt definitions (id, title, content)
- `cursor_projects.json` – array of project paths
- `prompt_ids.txt` – optional file listing IDs (one per line) for `-f`
