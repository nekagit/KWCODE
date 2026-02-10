import { Prompt } from '../../src-tauri/src/lib'; // Assuming Prompt is exported from lib.rs

export const seedPrompts: Prompt[] = [
  {
    id: "prompt-1",
    title: "Initial Project Setup",
    content: "Generate a basic project structure for a Next.js application with Tailwind CSS and TypeScript.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prompt-2",
    title: "Create User Authentication Flow",
    content: "Implement a complete user authentication flow including signup, login, and password reset functionalities.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];