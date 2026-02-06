# AI and Cursor project files index

Single index of all AI-related and Cursor-related files in this project. Use this for discovery and to keep `.cursor` and `nenad` in sync.

## Locations

| Kind | Primary location | Mirror / sync |
|------|------------------|---------------|
| **ADR** (Architecture Decision Records) | `nenad/adr/` | `.cursor/adr/` (same files, keep updated) |
| **PDR** (Project Decision Records) | `nenad/pdr/` | — |
| **This index** | `nenad/ai-project-files.md` | — |
| **Agent instructions** | `AGENTS.md` (repo root) | — |
| **Cursor rules** | `.cursor/rules/` (if used) | — |

## ADR – Architecture Decision Records

All ADRs live in **`nenad/adr/`**; copies are kept in **`.cursor/adr/`** for Cursor context.

| # | File | Title (slug) |
|---|------|--------------|
| 004 | `004-first-page-dashboard-kanban.md` | First page as Dashboard with quick actions and ticket kanban |
| 005 | `005-remove-workspace-path-setting.md` | Remove workspace path setting |
| 005 | `005-sidebar-order-dashboard-prompts-projects-tickets-features.md` | Sidebar order: Dashboard, Prompts, Projects, Tickets, Features |
| 005 | `005-sqlite-database-for-data.md` | SQLite database for data |
| 006 | `006-browser-mode-load-data-from-json-api.md` | Browser mode: load data from JSON API |
| 007 | `007-data-navigation-tab.md` | Data navigation tab |
| 008 | `008-sqlite-location-and-browser-data-tab.md` | SQLite location and browser data tab |
| 009 | `009-single-left-sidebar.md` | Single left sidebar |
| 010 | `010-prompts-and-configuration-separate-pages.md` | Prompts and configuration separate pages |
| 010 | `010-suspense-for-use-search-params.md` | Suspense for useSearchParams |
| 011 | `011-remove-top-navbar-dashboard.md` | Remove top navbar on dashboard |
| 012 | `012-tauri-dev-white-screen-fix.md` | Tauri dev white screen fix |
| 013 | `013-sidebar-log-data-section-configuration-below.md` | Sidebar: Log data section, Configuration below |
| 014 | `014-browser-load-data-from-api-implementation.md` | Browser load data from API implementation |
| 015 | `015-remove-prompts-and-timing-from-sidebar.md` | Remove prompts and timing from sidebar |
| 016 | `016-tickets-page-ai-generate-from-project.md` | Tickets page: AI generate from project |
| 017 | `017-run-page-navigation.md` | Run page navigation |
| 018 | `018-cursor-run-scripts-features-tickets.md` | Cursor run scripts: features, tickets |
| 019 | `019-stop-run-invoke-camelcase-runid.md` | Stop run: invoke camelCase runId |
| 020 | `020-ai-generate-tickets-project-analysis.md` | AI generate tickets: project analysis |
| 020 | `020-prompts-page-create-edit-generate-ai.md` | Prompts page: create, edit, generate AI |
| 020 | `020-toast-sonner-save-actions.md` | Toast (Sonner) for save actions |
| 021 | `021-shadcn-ui-components-app-wide.md` | shadcn UI components app-wide |
| 022 | `022-ideas-page-saas-iaas-paas.md` | Ideas page: SaaS, IaaS, PaaS |
| 023 | `023-design-page-config-generate-md.md` | Design page: config, generate MD |
| 023 | `023-shadcn-ui-components-app-wide.md` | shadcn UI components app-wide (.cursor) |
| 024 | `024-next-flight-client-entry-loader-fix.md` | Next flight client entry loader fix |
| 025 | `025-loading-overlay-inline-script-continue.md` | Loading overlay inline script continue |
| 026 | `026-tauri-dev-css-asset-prefix-critical.md` | Tauri dev: CSS asset prefix critical |
| 027 | `027-all-data-tab-projects-combined.md` | All-data tab: projects combined |
| 028 | `028-all-data-moved-to-log-data-section.md` | All data moved to Log data section |
| 028 | `028-projects-as-pages-design-ideas-features-tickets-prompts.md` | Projects as first-class pages |
| 029 | `029-design-export-json.md` | Design export JSON |
| 030 | `030-architecture-page-definitions-best-practices.md` | Architecture page: definitions, best practices |
| 031 | `031-project-export-json-linked-entities.md` | Project export JSON linked entities |
| 032 | `032-project-link-architecture.md` | Project link architecture |
| 032 | `032-template-project-seed.md` | Template project seed |
| 033 | `033-ai-and-cursor-files-index.md` | AI and Cursor files index |
| 034 | `034-project-entity-categorization.md` | Project entity categorization |
| 035 | `035-zustand-react-state-technology.md` | Zustand as React state technology |
| 036 | `036-delete-any-entity.md` | Delete any entity (ideas, prompts, projects, designs, architectures) |
| 037 | `037-next-cannot-find-module-chunk-clean-build.md` | Next.js "Cannot find module './1989.js'" – clean build fix |
| 038 | `038-configuration-page-css-fix.md` | Configuration page CSS fix (base tag + layout) |
| 039 | `039-projects-api-tauri-404-fix.md` | Projects API 404 in Tauri – backend + frontend helper |
| 040 | `040-projects-page-loading-timeout-retry.md` | Projects page: loading timeout and retry |
| 041 | `041-tauri-dev-wait-for-next-chunks.md` | Tauri dev: wait for Next.js chunks before opening |
| 042 | `042-app-loading-timeout-projects-page.md` | App and projects page loading timeouts |
| 043 | `043-seed-template-categorized-multiphased-major-features.md` | Seed template: categorized, multiphased tickets and major features |
| 044 | `044-tickets-tab-pagination.md` | Tickets tab: pagination and total count |
| 045 | `045-features-page-show-all-sync-json.md` | Features page: show all, Tauri sync with features.json |
| 046 | `046-prompts-page-all-data-table.md` | Prompts page: table of all prompt data |
| 047 | `047-all-data-project-details-single-source-tauri.md` | All data and project details: single source in Tauri |
| 048 | `048-root-loading-overlay-react-owned.md` | Root loading overlay: React-owned visibility |
| 049 | `049-tickets-tab-add-ticket-accordion.md` | Tickets tab: Add ticket in accordion |
| 050 | `050-feature-tab-filter-by-project.md` | Feature tab: filter features by project |
| 051 | `051-project-details-page-accordions.md` | Project details page: all sections in accordions |
| 052 | `052-prompts-page-remove-chip-grid-section.md` | Prompts page: remove chip/grid selection section |
| 053 | `053-feature-tab-queue-add-plus-run-later.md` | Feature tab: add to queue (+ per item), run queue later |
| 054 | `054-feature-tab-delete-all-button.md` | Feature tab: Delete all button |
| 055 | `055-projects-page-local-projects-section.md` | Projects page: Local projects section |
| 056 | `056-local-projects-create-project-from-path.md` | Local projects: select path and create project |
| 057 | `057-project-details-remove-group-by-accordion.md` | Project details page: remove Group by accordion |
| 058 | `058-project-details-cursor-folder-files-section.md` | Project details: .cursor folder files section at bottom |
| 059 | `059-remove-ai-generate-page.md` | Remove AI Generate page (tab) |
| 060 | `060-remove-delete-confirmation-dialogs.md` | Remove delete confirmation dialogs |
| 061 | `061-feature-data-milestone-at-least-one-ticket.md` | Feature data: milestones with at least one ticket |
| 062 | `062-design-config-markdown-viewer-sample-html.md` | Design config: markdown viewer and sample HTML preview |
| 063 | `063-project-spec-accordion-add-cursor-files.md` | Project Spec accordion: add .cursor files to project spec |
| 064 | `064-project-details-accordion-order.md` | Project details: accordion order (cursor files top, link bottom) |
| 065 | `065-project-spec-markdown-split-view.md` | Project spec: markdown view split next to card |
| 066 | `066-project-spec-export-design-architecture-features-download-cursor.md` | Project spec: export Design/Architecture/Features as .md, download all to .cursor |
| 067 | `067-project-details-best-practice-cursor-structure-button.md` | Project details: button to show best practice .cursor structure (file names + descriptions) |
| 068 | `068-project-details-analysis-button-cursor-prompt.md` | Project details: Analysis button (Design, Architecture, Tickets) with Cursor prompt → .cursor/*.md |
| 069 | `069-data-dir-paths-from-db-not-json.md` | Data dir and paths from DB, not hardcoded JSON |

## PDR – Project Decision Records

Project-level decisions (scope, product, process). Stored in **`nenad/pdr/`**.

- `nenad/pdr/README.md` – Purpose and template.

## .cursor directory

- **`.cursor/adr/`** – Mirror of `nenad/adr/` (all ADR `.md` files). Keep in sync when adding or changing ADRs.
- **`.cursor/rules/`** – Optional Cursor rules (e.g. RULE.md, file-specific rules). Not yet used.

## Other AI-related assets

- **`nenad/february-repos-overview.json`** – Repo/metadata overview for automation.
- **`data/`** – JSON data (projects, tickets, features, designs, ideas, architectures, etc.) used by the app and scripts.

## Conventions

1. **New ADRs**: Add under `nenad/adr/` with next number and slug; copy to `.cursor/adr/`.
2. **New PDRs**: Add under `nenad/pdr/` with number and slug.
3. **All new `.md`** (per project rule): Create under `nenad/` (or subfolders); update this index and `.cursor/adr/` when adding ADRs.
