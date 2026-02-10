"use client";

import { useMemo, ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Ticket as TicketIcon,
  Layers,
  Lightbulb,
  Palette,
  Building2,
} from "lucide-react";
import type { Project, ProjectEntityCategories } from "@/types/project";

interface ProjectTabsProps {
  project: Project;
  activeTab: ProjectEntityCategories;
  setActiveTab: (tab: ProjectEntityCategories) => void;
}

export function ProjectTabs({
  project,
  activeTab,
  setActiveTab,
}: ProjectTabsProps) {
  const entityCategories: { id: ProjectEntityCategories; label: string; icon: React.ElementType }[] = useMemo(
    () => [
      { id: "design", label: "Design", icon: Palette },
      { id: "ideas", label: "Ideas", icon: Lightbulb },
      { id: "features", label: "Features", icon: Layers },
      { id: "tickets", label: "Tickets", icon: TicketIcon },
      { id: "prompts", label: "Prompts", icon: MessageSquare },
      { id: "architecture", label: "Architecture", icon: Building2 },
    ],
    []
  );

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProjectEntityCategories)}>
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <TabsList>
          {entityCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              <category.icon className="h-4 w-4 mr-2" />
              {category.label} ({project[`${category.id}Ids` as keyof Project].length})
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
