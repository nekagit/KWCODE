"use client";

import { NewProjectForm } from "@/components/molecules/NewProjectForm/NewProjectForm";
import { NewProjectHeader } from "@/components/molecules/NewProjectHeader";

export function NewProjectPageContent() {
  return (
    <div className="space-y-6 max-w-xl">
      <NewProjectHeader
        title="New project"
        description="Create a project to group design, ideas, features, tickets, and prompts. You can add links to prompts, tickets, features, and ideas from the project details page."
      />
      <NewProjectForm />
    </div>
  );
}
