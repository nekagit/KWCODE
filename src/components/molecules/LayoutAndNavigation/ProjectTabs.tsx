"use client";

import { useMemo, ReactNode } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Ticket as TicketIcon,
  Layers,
  Lightbulb,
  Palette,
  Building2,
} from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs"; // Assuming TabsList is used with shadcn Tabs
import { ProjectTabTrigger } from "@/components/atoms/navigation/ProjectTabTrigger"; // Corrected import path
import type { Project, ProjectEntityCategories, ProjectTabCategory } from "@/types/project";

interface ProjectTabsProps {
  project: Project;
  activeTab: ProjectTabCategory;
  setActiveTab: (tab: ProjectTabCategory) => void;
}

export function ProjectTabs({
  project,
  activeTab,
  setActiveTab,
}: ProjectTabsProps) {
  const entityCategories: { id: ProjectTabCategory; label: string; icon: React.ElementType }[] = useMemo(
    () => [
      { id: "design", label: "Design", icon: Palette },
      { id: "ideas", label: "Ideas", icon: Lightbulb },
      { id: "features", label: "Features", icon: Layers },
      { id: "tickets", label: "Tickets", icon: TicketIcon },
      { id: "prompts", label: "PromptRecords", icon: MessageSquare },
      { id: "architecture", label: "Architecture", icon: Building2 },
    ],
    []
  );

  return (
    <Tabs value={activeTab} onValueChange={(v: ProjectTabCategory) => setActiveTab(v)}>
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {entityCategories.map((category) => (
            <ProjectTabTrigger
              key={category.id}
              category={category}
              project={project}
            />
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
