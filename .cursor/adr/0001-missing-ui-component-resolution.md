1. Title: Missing UI Component Resolution
2. Status: Completed
3. Context: The project encountered an error "Cannot find module '@/components/ui/badge' or its corresponding type declarations." when importing the `Badge` component in `src/components/atoms/ArchitectureDetailsDisplay.tsx`.
4. Decision: The `badge` component, provided by shadcn/ui, was missing from the project. To resolve this, the `badge` component was added using the shadcn CLI command `npx shadcn@latest add badge`.
5. Consequences: This action created the `src/components/ui/badge.tsx` file, making the `Badge` component available for import and resolving the module resolution error.