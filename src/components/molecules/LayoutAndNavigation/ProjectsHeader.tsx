"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderPlus, Plus, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/ProjectsHeader.tsx");

interface ProjectsHeaderProps {
  seeding: boolean;
  seedTemplateProject: () => Promise<void>;
  /** When provided, a Refresh button is shown that calls this and shows loading while refreshing. */
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  /** When provided, a Discover folders button is shown that opens the discover-folders dialog. */
  onDiscoverFolders?: () => void;
}

export function ProjectsHeader({
  seeding,
  seedTemplateProject,
  onRefresh,
  refreshing = false,
  onDiscoverFolders,
}: ProjectsHeaderProps) {
  return (
    <div className={classes[0]}>
      <PageHeader
        title="Projects"
        description={
          "Each project is a page that aggregates design, ideas, tickets, and prompts. Open a project to see all its data."
        }
      />
      <ButtonGroup alignment="right">
        {onRefresh != null && (
          <Button
            variant="outline"
            disabled={refreshing}
            onClick={onRefresh}
            aria-label="Refresh project list"
          >
            {refreshing ? <Loader2 className={classes[1]} /> : <RefreshCw className={classes[2]} />}
            Refresh
          </Button>
        )}
        {onDiscoverFolders != null && (
          <Button
            variant="outline"
            onClick={onDiscoverFolders}
            aria-label="Discover folders and add as projects"
            title="List folders from projects root that are not yet projects; add selected as projects"
          >
            <FolderPlus className={classes[2]} />
            Discover folders
          </Button>
        )}
        <Button
          variant="outline"
          disabled={seeding}
          onClick={seedTemplateProject}
        >
          {seeding ? <Loader2 className={classes[1]} /> : <Sparkles className={classes[2]} />}
          Seed template project
        </Button>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className={classes[2]} />
            New project
          </Link>
        </Button>
      </ButtonGroup>
    </div>
  );
}
