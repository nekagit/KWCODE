import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AllProjectsDisplayProps {
  allProjects: string[];
}

export const AllProjectsDisplay: React.FC<AllProjectsDisplayProps> = ({
  allProjects,
}) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">all_projects ({allProjects.length})</p>
      <ScrollArea className="h-24 rounded border bg-muted/30 p-3 font-mono text-xs">
        <pre>{JSON.stringify(allProjects, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};
