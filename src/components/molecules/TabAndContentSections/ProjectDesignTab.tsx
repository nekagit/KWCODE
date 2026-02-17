"use client";

import { Palette } from "lucide-react";
import type { Project } from "@/types/project";
import type { DesignRecord } from "@/types/design";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectDesignListItem } from "@/components/atoms/list-items/ProjectDesignListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("TabAndContentSections/ProjectDesignTab.tsx");

/** Project with resolved designs (from getProjectResolved). */
type ProjectWithDesigns = Project & { designs?: (DesignRecord & Record<string, unknown>)[] };

interface ProjectDesignTabProps {
  project: Project;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

function getDesignsToShow(project: Project): DesignRecord[] {
  const withDesigns = project as ProjectWithDesigns;
  const designIds = project.designIds ?? [];
  if (designIds.length === 0) return [];

  const resolved = withDesigns.designs;
  if (Array.isArray(resolved) && resolved.length > 0) {
    return designIds
      .map((id) => resolved.find((d) => d && (d as { id?: string }).id === id))
      .filter(Boolean)
      .map((d) => d as DesignRecord);
  }

  return designIds.map((id) => ({ id, name: id } as DesignRecord));
}

export function ProjectDesignTab({
  project,
  projectId,
  showHeader = true,
}: ProjectDesignTabProps) {
  const designs = getDesignsToShow(project);

  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Design"
          icon={<Palette className={classes[1]} />}
          project={project}
        />
      )}

      {designs.length === 0 ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : (
        <GridContainer>
          {designs.map((design) => (
            <ProjectDesignListItem
              key={design.id}
              design={design}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}
