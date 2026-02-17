"use client";

import { Building2 } from "lucide-react";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectArchitectureListItem } from "@/components/atoms/list-items/ProjectArchitectureListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectArchitectureTab.tsx");

/** Resolved architecture shape (when project is loaded with resolve=1). */
interface ResolvedArchitectureItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface ProjectArchitectureTabProps {
  project: Project & { architectures?: unknown[] };
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

export function ProjectArchitectureTab({
  project,
  projectId,
  showHeader = true,
}: ProjectArchitectureTabProps) {
  const resolvedList = Array.isArray(project.architectures) ? (project.architectures as ResolvedArchitectureItem[]) : [];
  const useResolved = resolvedList.length > 0;
  const ids = project.architectureIds ?? [];
  const showEmpty = !useResolved && ids.length === 0;

  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Architectures"
          icon={<Building2 className={classes[1]} />}
          project={project}
        />
      )}

      {showEmpty ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : (
        <GridContainer>
          {useResolved
            ? resolvedList.map((arch) => (
                <ProjectArchitectureListItem
                  key={arch.id}
                  architecture={{ id: arch.id, name: arch.name, description: arch.description }}
                  projectId={projectId}
                />
              ))
            : ids.map((architectureId) => (
                <ProjectArchitectureListItem
                  key={architectureId}
                  architecture={{ id: architectureId, name: architectureId }}
                  projectId={projectId}
                />
              ))}
        </GridContainer>
      )}
    </div>
  );
}
