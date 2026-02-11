import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AllProjectsDisplayListProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
}

export const AllProjectsDisplayList: React.FC<AllProjectsDisplayListProps> = ({
  allProjects,
  activeProjects,
  toggleProject,
}) => {
  return (
    <ScrollArea className="h-[200px] rounded border p-2">
      <div className="space-y-1">
        {allProjects.map((path) => {
          const name = path.split("/").pop() ?? path;
          const active = activeProjects.includes(path);
          return (
            <div key={path} className="flex items-center gap-2 text-sm">
              <Checkbox checked={active} onCheckedChange={() => toggleProject(path)} />
              <span className="truncate font-mono" title={path}>{name}</span>
              {active && <Badge variant="secondary" className="text-xs">active</Badge>}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
