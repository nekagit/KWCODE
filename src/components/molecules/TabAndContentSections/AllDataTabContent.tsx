"use client";

import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shadcn/button";
import { Folders, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Palette } from "lucide-react";
import type { Project } from "@/types/project";
import type { Prompt } from "@/types/prompt";
import type { Ticket } from "@/types/ticket";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { AllProjectsDisplayList } from "@/components/atoms/AllProjectsDisplayList";
import { PromptsDisplayList } from "@/components/atoms/PromptsDisplayList";
import { TicketsDisplayList } from "@/components/atoms/TicketsDisplayList";
import { FeaturesDisplayList } from "@/components/atoms/FeaturesDisplayList";
import { IdeasDisplayList } from "@/components/atoms/IdeasDisplayList";

interface AllDataTabContentProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  prompts: { id: number; title: string; description?: string }[];
  selectedPromptIds: number[];
  setSelectedPromptIds: (ids: number[]) => void;
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
  selectedPromptIds,
  setSelectedPromptIds,
  tickets,
  features,
  ideas,
  ideasLoading,
}: AllDataTabContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Database</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Combined view: projects, prompts, tickets, features, ideas, and design. Use this as the big project page.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          title={
            <>
              <Folders className="h-5 w-5" />
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
              <MessageSquare className="h-5 w-5" />
              Prompts
            </>
          }
          subtitle={`${prompts.length} prompts`}
        >
          <PromptsDisplayList
            prompts={prompts as Prompt[]}
            selectedPromptIds={selectedPromptIds}
            setSelectedPromptIds={setSelectedPromptIds}
          />
          <p className="text-xs text-muted-foreground mt-2">Select prompts for Run. Edit on Prompts page.</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          title={
            <>
              <TicketIcon className="h-5 w-5" />
              Tickets
            </>
          }
          subtitle={`${tickets.length} tickets`}
        >
          <TicketsDisplayList tickets={tickets as Ticket[]} />
          <p className="text-xs text-muted-foreground mt-2">Full list on Tickets tab.</p>
        </Card>
        <Card
          title={
            <>
              <Layers className="h-5 w-5" />
              Features
            </>
          }
          subtitle={`${features.length} features (prompts + projects)`}
        >
          <FeaturesDisplayList features={features as Feature[]} />
          <p className="text-xs text-muted-foreground mt-2">Configure on Feature tab.</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          title={
            <>
              <Lightbulb className="h-5 w-5" />
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
              <Palette className="h-5 w-5" />
              Design
            </>
          }
          subtitle="Design config and markdown spec"
        >
          <p className="text-sm text-muted-foreground mb-3">
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
