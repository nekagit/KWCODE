"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/ProjectsHeader.tsx");

interface ProjectsHeaderProps {
  /** Reserved for future use. */
  _?: never;
}

export function ProjectsHeader(_props?: ProjectsHeaderProps) {
  return (
    <div className={classes[0]}>
      <PageHeader
        title="Projects"
        description={
          "Each project is a page that aggregates design, ideas, tickets, and prompts. Open a project to see all its data."
        }
      />
      <ButtonGroup alignment="right">
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
