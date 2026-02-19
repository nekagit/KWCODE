"use client";

/** All Data Tab Content component. */
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Folders, MessageSquare, Lightbulb, Palette, LayoutGrid, CheckSquare, Square } from "lucide-react";
import type { PromptRecord } from "@/types/prompt";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { AllProjectsDisplayList } from "@/components/molecules/Displays/AllProjectsDisplayList";
import { PromptsDisplayList } from "@/components/molecules/Displays/PromptsDisplayList";
import { IdeasDisplayList } from "@/components/molecules/Displays/IdeasDisplayList";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("TabAndContentSections/AllDataTabContent.tsx");

interface AllDataTabContentProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  /** When provided, "Select all" and "Deselect all" are shown in the Projects card. */
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  prompts: { id: number; title: string; description?: string }[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
  tickets: { id: string; title: string; status: string; description?: string }[];
  ideas: { id: number; title: string; description: string; category: string }[];
  ideasLoading: boolean;
}

export function AllDataTabContent({
  allProjects,
  activeProjects,
  toggleProject,
  saveActiveProjects,
  onSelectAll,
  onDeselectAll,
  prompts,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
  ideas,
  ideasLoading,
}: AllDataTabContentProps) {
  return (
    <div className={classes[0]}>
      {/* Page header: clear identity, not form-like */}
      <header
        className="rounded-2xl border border-border/70 bg-gradient-to-br from-muted/40 via-background to-primary/5 dark:from-muted/30 dark:to-primary/10 p-5 mb-6 shadow-sm"
        aria-label="Database overview"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <LayoutGrid className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className={classes[1]}>Database</h2>
            <p className={classes[2]}>
              Combined view: projects, prompts, ideas, and design. Your central data hub.
            </p>
          </div>
        </div>
      </header>

      {/* Section cards in a single responsive grid */}
      <div className={classes[3]}>
        <Card
          title={
            <>
              <Folders className={classes[4]} />
              Projects
            </>
          }
          subtitle={`All (${allProjects.length}) · Active (${activeProjects.length})`}
          footerButtons={
            <ButtonGroup alignment="right">
              {onSelectAll != null && onDeselectAll != null && (
                <>
                  <Button variant="outline" size="sm" onClick={onSelectAll} aria-label="Select all projects">
                    <CheckSquare className="h-4 w-4 mr-1.5" aria-hidden />
                    Select all
                  </Button>
                  <Button variant="outline" size="sm" onClick={onDeselectAll} aria-label="Deselect all projects">
                    <Square className="h-4 w-4 mr-1.5" aria-hidden />
                    Deselect all
                  </Button>
                </>
              )}
              <Button size="sm" onClick={saveActiveProjects}>Save active</Button>
            </ButtonGroup>
          }
        >
          <AllProjectsDisplayList
            allProjects={allProjects}
            activeProjects={activeProjects}
            toggleProject={toggleProject}
          />
        </Card>
        <Card
          title={
            <>
              <MessageSquare className={classes[5]} />
              Prompt records
            </>
          }
          subtitle={`${prompts.length} prompts`}
        >
          <PromptsDisplayList
            prompts={prompts as PromptRecord[]}
            selectedPromptIds={selectedPromptRecordIds}
            setSelectedPromptIds={setSelectedPromptRecordIds}
          />
          <p className={classes[6]}>Select prompts for Run. Edit on Prompts page.</p>
        </Card>
        <Card
          title={
            <>
              <Lightbulb className={classes[8]} />
              Ideas
            </>
          }
          subtitle={ideasLoading ? "Loading…" : `${ideas.length} ideas`}
        >
          <IdeasDisplayList ideas={ideas} ideasLoading={ideasLoading} />
        </Card>
        <Card
          title={
            <>
              <Palette className={classes[5]} />
              Design
            </>
          }
          subtitle="Layout, colors, typography"
        >
          <p className={classes[9]}>
            Configure page layout, colors, typography, and sections. Generate markdown for implementation.
          </p>
        </Card>
      </div>
    </div>
  );
}
