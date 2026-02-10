"use client";

import { useMemo } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Database, ScrollText } from "lucide-react";
import type { ProjectEntityCategories } from "@/types/project";

const VALID_TABS = ["dashboard", "projects", "tickets", "feature", "all", "data", "log", "prompts"] as const;
export type TabValue = (typeof VALID_TABS)[number];

interface NavigationTabsProps {
  activeTab: TabValue;
  navigateToTab: (tab: TabValue) => void;
}

export function NavigationTabs({
  activeTab,
  navigateToTab,
}: NavigationTabsProps) {
  const tabs = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", icon: LayoutDashboard }, // Re-using for now, but should be Folders
      { id: "tickets", label: "Tickets", icon: TicketIcon },
      { id: "feature", label: "Features", icon: Layers },
      { id: "all", label: "All Data", icon: Database },
      { id: "data", label: "DB Data", icon: Database }, // Re-using for now
      { id: "log", label: "Log", icon: ScrollText },
      { id: "prompts", label: "Prompts", icon: MessageSquare },
    ],
    []
  );

  return (
    <TabsList>
      {tabs.map((tabItem) => (
        <TabsTrigger
          key={tabItem.id}
          value={tabItem.id}
          onClick={() => navigateToTab(tabItem.id)}
        >
          <tabItem.icon className="h-4 w-4 mr-2" />
          {tabItem.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
