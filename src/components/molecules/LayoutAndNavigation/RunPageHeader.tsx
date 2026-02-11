"use client";

import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/RunPageHeader.tsx");

export function RunPageHeader() {
  return (
    <PageHeader
      title="Run"
      description={
        <>
          Set prompts, projects, and optional feature to run{" "}
          <code className={classes[0]}>run_prompts_all_projects.sh</code>.
        </>
      }
    />
  );
}
