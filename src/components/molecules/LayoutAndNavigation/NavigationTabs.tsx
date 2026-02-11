"use client";

import { useMemo } from "react";
import { LayoutDashboard, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Database, ScrollText, Folders } from "lucide-react";
import { Tabs } from "@/components/shared/Tabs";
import { NavigationTabItem } from "@/components/atoms/NavigationTabItem";

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
      { id: "projects", label: "Projects", icon: Folders }, // Using Folders icon now
      { id: "tickets", label: "Tickets", icon: TicketIcon },
      { id: "feature", label: "Features", icon: Layers },
      { id: "all", label: "All Data", icon: Database },
      { id: "data", label: "DB Data", icon: Database },
      { id: "log", label: "Log", icon: ScrollText },
      { id: "prompts", label: "Prompts", icon: MessageSquare },
    ],
    []
  );

  return (
    <Tabs value={activeTab}>
      {tabs.map((tabItem) => (
        <NavigationTabItem
          key={tabItem.id}
          tabItem={tabItem}
          navigateToTab={navigateToTab}
        />
      ))}
    </Tabs>
  );
}
