# ADR 017: Run page in navigation for script parameters

## Status
Accepted

## Context
Start and Stop for `run_prompts_all_projects.sh` lived on the Prompts page, with a hint to "Select at least one prompt and one project (on Dashboard → Projects) to run." Users need a dedicated place to set all parameters (prompts, projects, optionally tickets/features) and start or stop the script, rather than splitting configuration across Dashboard and Prompts.

## Decision
- Add a **Run** item to the main sidebar navigation (after Dashboard), linking to `/run`.
- Create a dedicated **Run** page (`src/app/run/page.tsx`) that provides:
  - **Run from feature** (optional): dropdown to select a feature; selecting one prefills prompts and projects from that feature (prompt_ids, project_paths). If the feature has no project_paths, current project selection is kept.
  - **Prompts**: checklist of all prompts (same data as Prompts page); at least one must be selected to start.
  - **Projects**: checklist of all projects (from run-state allProjects/activeProjects); at least one must be selected to start. Selections are synced with Dashboard → Projects (same run-state).
  - **Run label** (optional): free-text name for the run (shown in running terminals and log).
  - **Start** and **Stop** buttons: Start calls `runWithParams` with selected prompt IDs, active projects, and optional run label; Stop calls `stopScript` to stop running script(s).
  - Helper text when Start is disabled: "Select at least one prompt and one project to run."
  - Links to Configuration (timing) and Log tab for output.
- Remove **Start** and **Stop** buttons from the **Prompts** page. Keep the prompt selection checklist and update the description to direct users to the Run page to start the script and to Configuration for timing.
- Run page loads features from Tauri (`get_features`) or browser (`/api/data`) for the "Run from feature" dropdown.

## Consequences
- Single place (Run) to configure and execute the script; prompts and projects can still be managed on Dashboard/Prompts, but execution is centralized on Run.
- Features (which bundle prompts and projects) can be used to prefill Run parameters in one click.
- Prompts page becomes configuration-only (select which prompts to use); Run page is execution-only with full parameter control.
- Navigation gains a clear "Run" entry for starting the script.
