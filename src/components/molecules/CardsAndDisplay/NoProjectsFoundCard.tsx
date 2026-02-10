"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Folders, Plus, Sparkles, Loader2 } from "lucide-react";

interface NoProjectsFoundCardProps {
  seeding: boolean;
  seedTemplateProject: () => Promise<void>;
}

export function NoProjectsFoundCard({
  seeding,
  seedTemplateProject,
}: NoProjectsFoundCardProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <Empty
          icon={<Folders className="h-6 w-6" />}
          title="No projects yet"
          description="Create a project to group design, ideas, features, tickets, and prompts in one place."
        />
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            disabled={seeding}
            onClick={seedTemplateProject}
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Seed template project
          </Button>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New project
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
