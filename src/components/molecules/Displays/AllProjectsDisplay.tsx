import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/AllProjectsDisplay.tsx");

interface AllProjectsDisplayProps {
  allProjects: string[];
}

export const AllProjectsDisplay: React.FC<AllProjectsDisplayProps> = ({
  allProjects,
}) => {
  return (
    <div>
      <p className={classes[0]}>all_projects ({allProjects.length})</p>
      <ScrollArea className={classes[1]}>
        <pre>{JSON.stringify(allProjects, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};
