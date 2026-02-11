"use client";

import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";

export function RunPageHeader() {
  return (
    <PageHeader
      title="Run"
      description={
        <>
          Set prompts, projects, and optional feature to run{" "}
          <code className="text-xs bg-muted px-1 rounded">run_prompts_all_projects.sh</code>.
        </>
      }
    />
  );
}
