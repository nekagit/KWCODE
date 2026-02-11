"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Folders, Plus, Sparkles, FolderOpen, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface ProjectsHeaderProps {
  showLocalProjects: boolean;
  setShowLocalProjects: (show: boolean) => void;
  seeding: boolean;
  seedTemplateProject: () => Promise<void>;
}

export function ProjectsHeader({
  showLocalProjects,
  setShowLocalProjects,
  seeding,
  seedTemplateProject,
}: ProjectsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <PageHeader
        title="Projects"
        description={
          "Each project is a page that aggregates design, ideas, features, tickets, and prompts. Open a project to see all its data."
        }
      />
      <ButtonGroup alignment="right">
        <Button
          variant="outline"
          onClick={() => setShowLocalProjects((v) => !v)}
          className={showLocalProjects ? "bg-accent" : ""}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Local projects
        </Button>
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
    </div>
  );
}
