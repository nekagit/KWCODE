"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folders } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { ProjectCheckboxItem } from "@/components/atoms/checkbox-groups/ProjectCheckboxItem";

interface ProjectSelectionCardProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
}

export function ProjectSelectionCard({
  allProjects,
  activeProjects,
  toggleProject,
}: ProjectSelectionCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Folders} title="Projects" className="text-lg" iconClassName="text-success/90" />}
      subtitle="Select at least one project to run the script against (Dashboard → Projects also saves this list)."
    >
      <ScrollArea className="h-[180px] rounded-md border p-3">
        <div className="flex flex-wrap gap-2">
          {allProjects.map((path) => (
            <ProjectCheckboxItem
              key={path}
              path={path}
              isChecked={activeProjects.includes(path)}
              onToggle={toggleProject}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
