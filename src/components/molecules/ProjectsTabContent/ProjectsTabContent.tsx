"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folders } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Active repos (for this run)</CardTitle>
        <CardDescription className="text-base">
          Check repo paths to include when running prompts. Order is preserved. Save writes cursor_projects.json. For project pages (design, ideas, features, tickets, prompts), use <strong>Projects</strong> in the sidebar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[280px] rounded-md border p-3">
          <div className="space-y-2">
            {allProjects.map((path) => {
              const name = path.split("/").pop() ?? path;
              return (
                <label
                  key={path}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={activeProjects.includes(path)}
                    onCheckedChange={() => toggleProject(path)}
                  />
                  <span className="truncate text-sm font-mono" title={path}>
                    {name}
                  </span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
        <Button onClick={() => saveActiveProjects([])}>Save active to cursor_projects.json</Button>
      </CardContent>
    </Card>
  );
}
