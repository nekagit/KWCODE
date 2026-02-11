"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Folders, Plus, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface NoProjectsFoundCardProps {
  seeding: boolean;
  seedTemplateProject: () => Promise<void>;
}

export function NoProjectsFoundCard({
  seeding,
  seedTemplateProject,
}: NoProjectsFoundCardProps) {
  return (
    <Card
      footerButtons={
        <ButtonGroup alignment="right">
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
        </ButtonGroup>
      }
    >
      <EmptyState
        icon={Folders}
        message="No projects yet"
        action="Create a project to group design, ideas, features, tickets, and prompts in one place."
      />
    </Card>
  );
}
