"use client";

import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ProjectCheckboxListItem } from "@/components/atoms/list-items/ProjectCheckboxListItem";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectsTabContent.tsx");

interface ProjectsTabContentProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
  saveActiveProjects: (activeProjectsFallback: string[]) => Promise<void>;
}

export function ProjectsTabContent({
  allProjects,
  activeProjects,
  toggleProject,
  saveActiveProjects,
}: ProjectsTabContentProps) {
  return (
    <Card
      title="Active repos (for this run)"
      subtitle={
        "Check repo paths to include when running prompts. Order is preserved. Save writes cursor_projects.json. For project pages (design, ideas, tickets, prompts), use Projects in the sidebar."
      }
      footerButtons={
        <ButtonGroup alignment="right">
          <Button onClick={() => saveActiveProjects(activeProjects)}>Save active to cursor_projects.json</Button>
        </ButtonGroup>
      }
    >
      <ScrollArea className={classes[0]}>
        <div className={classes[1]}>
          {allProjects.map((path) => {
            const name = path.split("/").pop() ?? path;
            return (
              <ProjectCheckboxListItem
                key={path}
                path={path}
                name={name}
                isChecked={activeProjects.includes(path)}
                onToggle={toggleProject}
              />
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
