import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActiveProjectsDisplayProps {
  activeProjects: string[];
}

export const ActiveProjectsDisplay: React.FC<ActiveProjectsDisplayProps> = ({
  activeProjects,
}) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">cursor_projects / active ({activeProjects.length})</p>
      <ScrollArea className="h-24 rounded border bg-muted/30 p-3 font-mono text-xs">
        <pre>{JSON.stringify(activeProjects, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};
