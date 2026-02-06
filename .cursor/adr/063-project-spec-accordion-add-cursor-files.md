# ADR 063: Project Spec accordion – add .cursor files to project spec

## Status

Accepted.

## Context

Users want to curate which files from a project's `.cursor` folder (Design, Architecture, rules, ADRs, etc.) belong to the "project spec." They need a way to add those files from the "Files in .cursor" list and see them in one place.

## Decision

- **Data model**
  - Add optional `specFiles?: { name: string; path: string }[]` to the `Project` type. Each entry is a file from the project's `.cursor` folder that the user has added to the project spec.
  - Persist `specFiles` in `projects.json` and via Tauri `update_project` (full project JSON); no schema change in Rust, field is passed through.
- **API**
  - Projects GET/PUT/PATCH (and Tauri get/update) accept and return `specFiles`. In the Next route, validate that each element has `name` and `path` strings before merging.
- **Project details page**
  - Add an accordion **"Project Spec"** that lists all files in `project.specFiles`: name, path, and a Remove button. Default open with "Files in .cursor."
  - In the **"Files in .cursor"** section, for each listed file add an **"Add"** button that adds that file to the project spec (append to `specFiles` and call `updateProject` then refetch). If the file is already in `specFiles`, show "Added" and disable the button.
  - Saving add/remove updates the project via existing `updateProject`; show a brief saving state if desired.

## Consequences

- Users can build a project spec from the current project's .cursor files (Design, Architecture, rules, etc.) and see them in the Project Spec accordion.
- Spec is stored per project and survives reload; export can include `specFiles` for portability.
