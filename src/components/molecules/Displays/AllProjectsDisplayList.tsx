import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/AllProjectsDisplayList.tsx");

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
    <ScrollArea className={classes[0]}>
      <div className={classes[1]}>
        {allProjects.map((path) => {
          const name = path.split("/").pop() ?? path;
          const active = activeProjects.includes(path);
          return (
            <div key={path} className={classes[2]}>
              <Checkbox checked={active} onCheckedChange={() => toggleProject(path)} />
              <span className={classes[3]} title={path}>{name}</span>
              {active && <Badge variant="secondary" className={classes[4]}>active</Badge>}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
