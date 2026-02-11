---
title: Resolve Next.js Client Component Error in IdeasPageContent
issue: N/A
---

## Context
A build error occurred in Next.js because `useState` and `useEffect` React Hooks were being used in `src/components/organisms/IdeasPageContent.tsx`, which was implicitly treated as a Server Component. Next.js requires components that use client-side hooks to be explicitly marked with the `"use client"` directive.

## Decision
Added the `"use client"` directive at the top of `src/components/organisms/IdeasPageContent.tsx`.

## Status
Completed.

## Consequences
The `IdeasPageContent` component will now be correctly rendered as a Client Component, allowing the use of `useState` and `useEffect` without build errors. This resolves the immediate issue and aligns the component with Next.js's component model.
