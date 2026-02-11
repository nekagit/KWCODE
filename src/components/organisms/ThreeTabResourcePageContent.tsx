"use client";

import React from "react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { ThreeTabLayout } from "@/components/molecules/LayoutAndNavigation/ThreeTabLayout";

export interface ThreeTabResourceConfig {
  title: string;
  description: string;
  icon?: React.ReactNode;
  tabLabels: [string, string, string];
  tabListClassName?: string;
}

export interface ThreeTabResourcePageContentProps<TResource> {
  config: ThreeTabResourceConfig;
  resource: TResource;
  renderTemplatesTab: (resource: TResource) => React.ReactNode;
  renderAiTab: (resource: TResource) => React.ReactNode;
  renderMineTab: (resource: TResource) => React.ReactNode;
  renderDialogs?: (resource: TResource) => React.ReactNode;
}

export function ThreeTabResourcePageContent<TResource>({
  config,
  resource,
  renderTemplatesTab,
  renderAiTab,
  renderMineTab,
  renderDialogs,
}: ThreeTabResourcePageContentProps<TResource>) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        icon={config.icon}
      />
      <ThreeTabLayout
        tabLabels={config.tabLabels}
        tabListClassName={config.tabListClassName}
        templatesContent={renderTemplatesTab(resource)}
        aiContent={renderAiTab(resource)}
        mineContent={renderMineTab(resource)}
      />
      {renderDialogs?.(resource)}
    </div>
  );
}
