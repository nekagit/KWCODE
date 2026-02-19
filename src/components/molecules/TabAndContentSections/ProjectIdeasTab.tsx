"use client";

/** Project Ideas Tab component. */
import { useState, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import type { Project } from "@/types/project";
import type { IdeaRecord } from "@/types/idea";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectIdeaListItem } from "@/components/atoms/list-items/ProjectIdeaListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { ConvertToMilestonesDialog } from "@/components/molecules/FormsAndDialogs/ConvertToMilestonesDialog";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectIdeasTab.tsx");

type ProjectWithIdeas = Project & { ideas?: IdeaRecord[] };

interface ProjectIdeasTabProps {
  project: ProjectWithIdeas;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
  /** Optional: called after creating milestones so parent can refresh project (e.g. refetch). */
  fetchProject?: () => Promise<void>;
}

export function ProjectIdeasTab({
  project,
  projectId,
  showHeader = true,
  fetchProject,
}: ProjectIdeasTabProps) {
  const [convertMilestonesOpen, setConvertMilestonesOpen] = useState(false);
  const [convertMilestonesDefaultName, setConvertMilestonesDefaultName] = useState("");

  const ideaIds = project.ideaIds ?? [];
  const resolvedIdeas = (project as ProjectWithIdeas).ideas;
  const ideas: IdeaRecord[] =
    Array.isArray(resolvedIdeas) && resolvedIdeas.length > 0
      ? resolvedIdeas
      : ideaIds.map((id) => ({
          id,
          title: `Idea ${id}`,
          description: "",
          category: "other" as const,
          source: "manual" as const,
        }));

  const handleConvertToMilestones = useCallback((idea: IdeaRecord) => {
    setConvertMilestonesDefaultName(idea.title);
    setConvertMilestonesOpen(true);
  }, []);

  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Ideas"
          icon={<Lightbulb className={classes[1]} />}
          project={project}
        />
      )}

      {ideaIds.length === 0 ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : (
        <GridContainer>
          {ideas.map((idea) => (
            <ProjectIdeaListItem
              key={idea.id}
              idea={idea}
              projectId={projectId}
              onConvertToMilestones={handleConvertToMilestones}
            />
          ))}
        </GridContainer>
      )}

      <ConvertToMilestonesDialog
        isOpen={convertMilestonesOpen}
        onClose={() => setConvertMilestonesOpen(false)}
        projectId={projectId}
        defaultName={convertMilestonesDefaultName}
        onSuccess={fetchProject}
      />
    </div>
  );
}
