"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProjectItem {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectsListProps {
  projects: ProjectItem[];
  title?: string;
  className?: string;
}

export function ProjectsList({
  projects,
  title = "Recent projects",
  className,
}: ProjectsListProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="text-sm font-medium text-foreground"
              >
                {p.name}
                <span className="ml-2 text-muted-foreground">({p.slug})</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
