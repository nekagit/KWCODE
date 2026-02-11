"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Folders, Plus, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/NoProjectsFoundCard.tsx");

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
            {seeding ? <Loader2 className={classes[0]} /> : <Sparkles className={classes[1]} />}
            Seed template project
          </Button>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className={classes[1]} />
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
