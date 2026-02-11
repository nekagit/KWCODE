"use client";

import { NewProjectForm } from "@/components/molecules/FormsAndDialogs/NewProjectForm";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";

export function NewProjectPageContent() {
  return (
    <SingleContentPage
      title="New project"
      description="Create a project to group design, ideas, features, tickets, and prompts. You can add links to prompts, tickets, features, and ideas from the project details page."
      backLink="/projects"
      layout="simple"
      className="space-y-6 max-w-xl"
    >
      <NewProjectForm />
    </SingleContentPage>
  );
}
