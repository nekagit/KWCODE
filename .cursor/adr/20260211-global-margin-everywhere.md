# ADR: Add margin everywhere (global spacing pass)

## Date
2026-02-11

## Status
Accepted

## Context
User requested to "add margin everywhere a bit" to improve breathing room and readability across the app. A single central pass was preferred over ad-hoc fixes.

## Decision
Applied a consistent bump to margins and padding in two places:

### 1. Shared components (`shared-classes.json`)
- **Card**: root `mb-6` → `mb-8`, subtitle `mt-1.5` → `mt-2`, body `pt-4` → `pt-5`
- **CheckboxGroup**: inner `space-y-2.5` → `space-y-3`, emptyMessage `py-4` → `py-5`
- **Dialog**: panel `p-8` → `p-8 md:p-10`, header `pb-4` → `pb-5`, body `mt-5 mb-6` → `mt-6 mb-8`, actions `pt-5` → `pt-6`
- **Form**: root `space-y-6` → `space-y-7`
- **FormField**: root `gap-3` → `gap-4`
- **Header / ProjectHeader**: root `mb-2` → `mb-4`
- **List**: item `py-5` → `py-6`, `px-2` → `px-3`
- **ListItemCard**: header `mb-4` → `mb-5`, content `mb-4` → `mb-5`, footer `mt-4 pt-4` → `mt-5 pt-5`
- **PageHeader**: root `mb-8 pb-6` → `mb-10 pb-8`
- **ProjectCategoryHeader**: root `mb-2` → `mb-4`
- **Table**: th `py-4` → `py-5`
- **Tabs**: tabsWrapper `mb-6` → `mb-8`, tabButtonBase `px-3` → `px-4`
- **GridContainer**: root `gap-6` → `gap-8`
- **EmptyState**: root `p-12` → `p-14`, icon/iconWrapper `mb-5` → `mb-6`, title `mb-2` → `mb-3`, description `mb-3` → `mb-4`, action `mt-6` → `mt-8`
- **LoadingState**: root `p-12` → `p-14`, text `mt-5` → `mt-6`
- **ErrorDisplay**: root `py-4` → `py-5`, header `mb-2` → `mb-3`, details `mt-3` → `mt-4`, retryButton `mt-4` → `mt-5`
- **JsonDisplay**: title `mb-3` → `mb-4`

### 2. Page/organism content (`tailwind-organisms.json`)
- **HomePageContent**: content slots `pt-6 pb-6 px-4` → `pt-8 pb-8 px-5`, `space-y-6` → `space-y-8`, header `mb-4` → `mb-6`, `pb-2` → `pb-3`
- **NewProjectPageContent**: `space-y-6` → `space-y-8`
- **ProjectDetailsPageContent**: content slots `pt-6 pb-6 px-4` → `pt-8 pb-8 px-5`, `gap-6` / `space-y-6` → `gap-8` / `space-y-8`, `mt-4` → `mt-6`, `space-y-4` → `space-y-5`, `gap-2 p-2` → `gap-3 p-3`
- **ProjectsListPageContent**: `space-y-6` → `space-y-8`, `space-y-3` → `space-y-4`, list `p-4` → `p-5`, item `py-1.5 px-2` → `py-2 px-3`
- **PromptRecordsPageContent**: `space-y-4` → `space-y-6`, `gap-2` → `gap-3`, `mt-1` → `mt-2`, `py-4` → `py-5`
- **RunPageContent**: `space-y-6` → `space-y-8`
- **SingleContentPage**: `space-y-6` → `space-y-8`
- **TestingPageContent**: `space-y-6` → `space-y-8`, content `pt-6 pb-6 px-4` → `pt-8 pb-8 px-5`, `mt-6` → `mt-8`, `p-2` → `p-3`
- **ThreeTabResourcePageContent**: `space-y-6` → `space-y-8`
- **TicketBoard**: root `p-3` → `p-4`, header `px-4 py-3` → `px-5 py-4`, content `p-4` → `p-5`, `space-y-3` → `space-y-4`

### 3. App shell
- **Main content area**: added `xl:p-12` so large viewports get slightly more padding.

## Consequences
- All cards, forms, dialogs, lists, tabs, and page content have slightly more margin and padding.
- Layout remains consistent; no structural or behavior changes.
- Improves scanability and reduces visual crowding app-wide.
