"use client";

import { Palette } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("DesignPageContent.tsx");

export function DesignPageContent() {
  return (
    <div className={c["0"]} data-shared-ui>
      <PageHeader
        title="Design"
        description="Design configurations, UI specs, and design system. Manage design templates and link them to projects."
        icon={<Palette className={c["1"]} />}
      />
      <div className={c["2"]}>
        <p className="text-sm">Design content and templates will be available here. Use the Configuration page for app settings.</p>
      </div>
    </div>
  );
}
