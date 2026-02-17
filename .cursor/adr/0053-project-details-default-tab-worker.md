# ADR 0053: Project details default tab — Worker

## Status
Accepted

## Context
Project details page had default tab "todo" (Planner). Users often open a project to run or monitor worker tasks first.

## Decision
Default the project details page to the **Worker** tab on load. Initial state in `ProjectDetailsPageContent` changed from `useState("todo")` to `useState("worker")`.

## Consequences
- Opening a project shows Worker tab by default (run scripts, analyze queue, debugging).
- Planner (todo) remains available; users can switch to it when needed.
