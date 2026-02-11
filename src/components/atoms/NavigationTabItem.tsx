import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { TabValue } from "./NavigationTabs";

interface NavigationTabItemProps {
  tabItem: { id: TabValue; label: string; icon: React.ElementType };
  navigateToTab: (tab: TabValue) => void;
}

export const NavigationTabItem: React.FC<NavigationTabItemProps> = ({
  tabItem,
  navigateToTab,
}) => {
  return (
    <TabsTrigger
      key={tabItem.id}
      value={tabItem.id}
      onClick={() => navigateToTab(tabItem.id)}
    >
      <tabItem.icon className="h-4 w-4 mr-2" />
      {tabItem.label}
    </TabsTrigger>
  );
};
