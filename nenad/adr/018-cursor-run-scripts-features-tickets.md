# ADR 018: Cursor run scripts for features, tickets, and single project

## Status
Accepted

## Context
The app already had `script/run_prompts_all_projects.sh` to run prompts (by ID) across all projects via Cursor automation (focus window, Shift+Tab x3, Cmd+N, paste, Enter). Users need similar automation for:
- **Feature tickets**: run one feature (prompts + optional ticket descriptions) on that feature’s projects.
- **Single ticket**: run one ticket’s title/description across projects.
- **All features once**: run each feature in `features.json` once on its `project_paths`.
- **Single project**: run prompts on one project only (by path or index).

Data lives in `data/`: `prompts-export.json`, `features.json`, `tickets.json`, `cursor_projects.json`.

## Decision
- **Shared logic**: Add `script/common_cursor_run.sh` to be sourced by run scripts. It defines:
  - Paths: `WORKSPACE_ROOT`, `DATA_DIR`, `PROMPTS_JSON`, `FEATURES_JSON`, `TICKETS_JSON`, `DEFAULT_PROJECTS_JSON`, `DEFAULT_PROJECTS`.
  - Timing env vars: `SLEEP_AFTER_OPEN_PROJECT`, `SLEEP_AFTER_WINDOW_FOCUS`, etc.
  - Helpers: `log_info`, `log_success`, `log_warn`, `set_clipboard`, `read_projects_from_json`, `open_cursor_project`, `focus_cursor_window`, `focus_left_panel_with_shift_tab`, `create_new_agent`, `paste_and_submit`, `run_project`.
- **New scripts** (all source `common_cursor_run.sh`):
  1. **run_feature_tickets.sh** – Run one feature: select by `-i FEATURE_ID` or `-t "Title"` (or first feature). Build content from `prompt_ids` (+ optional ticket descriptions with `-n`). Projects: feature’s `project_paths`, or `-f projects.json`, or `cursor_projects.json`. Optional `-l` to loop.
  2. **run_ticket_all_projects.sh** – Run one ticket: select by `-i TICKET_ID` or `-t "Title"` (or first). Content = title + description. Projects from `-f` or default. Optional `-l`.
  3. **run_all_features_once.sh** – For each feature in `features.json`, build prompt+tickets (optional `-n`), run on that feature’s `project_paths` (or `-f` / default). One pass, no loop.
  4. **run_prompts_single_project.sh** – Same as run_prompts but one project: `-p ID [ID ...]`, `-P /path` or `-I index` into project list, optional `-l`.
- **Existing script**: `run_prompts_all_projects.sh` is left as-is (no refactor to source common in this change to avoid unnecessary churn; scripts can be refactored later to source common if desired).
- All new scripts are executable and live under `script/`.

## Consequences
- Users can run feature-based and ticket-based automation from the shell in line with the app’s Features and Tickets tabs.
- Shared Cursor automation lives in one place for future scripts; new runners stay short and data-focused.
- Same timing and accessibility requirements as the original script (macOS, Cursor, Accessibility permission for System Events).
