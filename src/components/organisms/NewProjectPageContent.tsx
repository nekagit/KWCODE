"use client";

import { NewProjectForm } from "@/components/molecules/FormsAndDialogs/NewProjectForm";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("NewProjectPageContent.tsx");

export function NewProjectPageContent() {
  return (
    <SingleContentPage
      title="New project"
      description="Create a project to group design, ideas, tickets, and prompts. You can add links to prompts, tickets, and ideas from the project details page."
      backLink="/projects"
      layout="simple"
      className={c["0"]}
    >
      <div className="mt-8 max-w-2xl">
        <NewProjectForm />
      </div>
    </SingleContentPage>
  );
}
