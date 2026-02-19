"use client";

/** Three Tab Layout component. */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/ThreeTabLayout.tsx");

const DEFAULT_TAB_VALUES = ["templates", "ai", "mine"] as const;

export type ThreeTabValue = (typeof DEFAULT_TAB_VALUES)[number];

interface ThreeTabLayoutProps {
  defaultValue?: ThreeTabValue;
  tabLabels: [string, string, string];
  templatesContent: React.ReactNode;
  aiContent: React.ReactNode;
  mineContent: React.ReactNode;
  tabListClassName?: string;
}

export function ThreeTabLayout({
  defaultValue = "templates",
  tabLabels,
  templatesContent,
  aiContent,
  mineContent,
  tabListClassName = "grid w-full max-w-md grid-cols-3",
}: ThreeTabLayoutProps) {
  return (
    <Tabs defaultValue={defaultValue} className={classes[0]}>
      <TabsList className={tabListClassName}>
        <TabsTrigger value="templates">{tabLabels[0]}</TabsTrigger>
        <TabsTrigger value="ai">{tabLabels[1]}</TabsTrigger>
        <TabsTrigger value="mine">{tabLabels[2]}</TabsTrigger>
      </TabsList>
      <TabsContent value="templates" className={classes[1]}>
        {templatesContent}
      </TabsContent>
      <TabsContent value="ai" className={classes[1]}>
        {aiContent}
      </TabsContent>
      <TabsContent value="mine" className={classes[1]}>
        {mineContent}
      </TabsContent>
    </Tabs>
  );
}
