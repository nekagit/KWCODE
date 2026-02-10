"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Checkbox } from "@/components/shadcn/checkbox";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Folders } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Folders className="h-4 w-4" />
          Projects
        </CardTitle>
        <CardDescription>
          Select at least one project to run the script against (Dashboard → Projects also saves
          this list).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] rounded-md border p-3">
          <div className="flex flex-wrap gap-2">
            {allProjects.map((path) => (
              <label
                key={path}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
              >
                <Checkbox
                  checked={activeProjects.includes(path)}
                  onCheckedChange={() => toggleProject(path)}
                />
                <span className="text-sm truncate max-w-[320px]" title={path}>
                  {path.split("/").pop() ?? path}
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
