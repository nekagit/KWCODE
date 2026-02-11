"use client";

import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Folders, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Palette } from "lucide-react";
import type { Project, Feature } from "@/types/project";
import type { PromptRecord } from "@/types/prompt";
import type { TicketRow } from "@/types/ticket";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { AllProjectsDisplayList } from "@/components/molecules/Displays/AllProjectsDisplayList";
import { PromptsDisplayList } from "@/components/molecules/Displays/PromptsDisplayList";
import { TicketsDisplayList } from "@/components/molecules/Displays/TicketsDisplayList";
import { FeaturesDisplayList } from "@/components/molecules/Displays/FeaturesDisplayList";
import { IdeasDisplayList } from "@/components/molecules/Displays/IdeasDisplayList";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/AllDataTabContent.tsx");

interface AllDataTabContentProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  prompts: { id: number; title: string; description?: string }[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
  tickets: { id: string; title: string; status: string; description?: string }[];
  features: { id: string; title: string; prompt_ids: number[]; project_paths: string[] }[];
  ideas: { id: number; title: string; description: string; category: string }[];
  ideasLoading: boolean;
}

export function AllDataTabContent({
  allProjects,
  activeProjects,
  toggleProject,
  saveActiveProjects,
  prompts,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
  tickets,
  features,
  ideas,
  ideasLoading,
}: AllDataTabContentProps) {
  return (
    <div className={classes[0]}>
      <div>
        <h2 className={classes[1]}>Database</h2>
        <p className={classes[2]}>
          Combined view: projects, prompts, tickets, features, ideas, and design. Use this as the big project page.
        </p>
      </div>

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
              PromptRecords
            </>
          }
          subtitle={`${prompts.length} prompts`}
        >
          <PromptsDisplayList
            prompts={prompts as PromptRecord[]}
            selectedPromptIds={selectedPromptRecordIds}
            setSelectedPromptIds={setSelectedPromptRecordIds}
          />
          <p className={classes[6]}>Select prompts for Run. Edit on PromptRecords page.</p>
        </Card>
      </div>

      <div className={classes[3]}>
        <Card
          title={
            <>
              <TicketIcon className={classes[8]} />
              Tickets
            </>
          }
          subtitle={`${tickets.length} tickets`}
        >
          <TicketsDisplayList tickets={tickets as TicketRow[]} />
          <p className={classes[6]}>Full list on Tickets tab.</p>
        </Card>
        <Card
          title={
            <>
              <Layers className={classes[10]} />
              Features
            </>
          }
          subtitle={`${features.length} features (prompts + projects)`}
        >
          <FeaturesDisplayList features={features as Feature[]} />
          <p className={classes[6]}>Configure on Feature tab.</p>
        </Card>
      </div>

      <div className={classes[3]}>
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
          subtitle="Design config and markdown spec"
        >
          <p className={classes[15]}>
            Configure page layout, colors, typography, and sections. Generate markdown for implementation.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/design">Open Design page</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
