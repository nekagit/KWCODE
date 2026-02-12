"use client";

import { TestTube2 } from "lucide-react";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectTestingTab.tsx");

interface ProjectTestingTabProps {
  project: Project;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

export function ProjectTestingTab({
  project,
  projectId,
  showHeader = true,
}: ProjectTestingTabProps) {
  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Testing"
          icon={<TestTube2 className={classes[1]} />}
          project={project}
        />
      )}

      <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
    </div>
  );
}
